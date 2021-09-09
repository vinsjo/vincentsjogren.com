import ApiRequest from "./modules/ApiRequest.js";
import BgLoader from "./modules/BgLoader.js";
const bgContainer = document.getElementById("bg-container") as HTMLDivElement;
const pageWrapper = document.getElementById("page-wrapper") as HTMLDivElement;
const apiRequestUrl = "http://localhost/vincentsjogren_api/";
const fallbackImg =
	"http://localhost/vincentsjogren_test/public/img/default.jpg";

window.onload = async () => {
	const apiHeaders = {Accept: "application/json"};
	const apiReq = new ApiRequest(apiRequestUrl, apiHeaders);
	const result = await apiReq.sendRequest();
	if (typeof result === "boolean") {
		bgContainer.style.backgroundImage = "url(" + fallbackImg + ")";
		bgContainer.style.opacity = "1";
	} else {
		const loader = new BgLoader(
			bgContainer,
			result.img_files,
			result.img_sizes,
			result.img_base_url,
			result.img_prefix
		);
		loader.setTransition(200, "ease-in-out");
		await loader.init();
		loader.handleClick(pageWrapper);
		window.onkeydown = (ev: KeyboardEvent) => {
			loader.handleKeyDown(ev);
		};
	}
};
