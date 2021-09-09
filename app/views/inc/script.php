<?php
    $IH     = new ImageHandler();
    $images = $IH->getImages();
    $sizes  = [];
    foreach (IMG_SIZES as $key => $value) {
        $sizes[] = ["key" => $key, "value" => $value];
    }
?>
<script type="module" async defer>
const bg = document.getElementById("background-img");
<?php if (empty($images)): ?>
bg.style.opacity = 1;
<?php else: ?>
import BackgroundLoader from "<?php echo URL_PUBLIC; ?>/js/BackgroundLoader.js";
import json_decode from "<?php echo URL_PUBLIC; ?>/js/json_decode.js";
const coverDiv = document.getElementById("background-cover");
const loader = new BackgroundLoader(
    bg,
    '<?php echo URL_PUBLIC_IMG . "/"; ?>',
    '<?php echo IMG_PREFIX; ?>',
    json_decode('<?php echo json_encode($images); ?>'),
    json_decode('<?php echo json_encode($sizes); ?>')
);
loader.setTransition(100, "ease-in-out");

window.onload = async function() {
    try {
        await loader.init();
        coverDiv.onclick = function(e) {
            if (e.target === coverDiv) {
                loader.next();
            }
        };
        document.onkeydown = function(e) {
            if (e.key === "ArrowRight" || e.key === " ") {
                loader.next();
            } else if (e.key === "ArrowLeft") {
                loader.previous();
            }
        };
    } catch (e) {
        console.error(e);
    }
};
<?php endif; ?>
</script>