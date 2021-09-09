export type ImgInfo = {name: string; ext: string; ls: boolean; ratio: number};
export type SizeInfo = {key: string; value: number};
export type SizeTemplate = {
	w: number;
	h: number;
	max: number;
	min: number;
	ratio: number;
	ls: boolean;
};
export type ApiResult = {
	updated_at: string;
	img_base_url: string;
	img_prefix: string;
	img_sizes: SizeInfo[];
	img_files: ImgInfo[];
};
export type ApiError = {time?: string; code: string | number; message: string};
export type ApiResponse = {
	result: ApiResult;
	error?: ApiError;
	status: string;
};
