<h1 style="font-family:Arial, Helvetica, sans-serif;">
    <?php
        if (!empty($_GET)) {
            echo join("/", $_GET);
        } else {
            echo "Work in progress";
        }

    ?>
</h1>