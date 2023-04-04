<?php

/**
 * Creates import proxy to load animation faster
 */




function findRoot(string $path, string $file = 'package.json'): string
{


    $relative = '';

    do {
        $prev = $path;
        $path = dirname($path);
        $relative .= '../';
        if (is_file($path . DIRECTORY_SEPARATOR . $file)) {
            return rtrim($relative, '/');
        }
    } while ($prev !== $path);
    throw new RuntimeException('Cannot find root path', 1);
}

function getImports($file)
{

    $dirname = dirname($file);


    if ($dirname === '.') {
        $dirname = '';
    } else {
        $dirname .= '/';
    }

    $contents = file_get_contents($file);

    var_dump($file, $dirname, $contents);

    $result = [];

    if (preg_match_all('#^@import(.*?);#sm', $contents, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $singlematch) {
            list(, $str) = $singlematch;

            foreach (explode(',', $str) as $import) {

                $file = trim(trim($import), '"');

                if (!str_ends_with($file, '.scss')) {
                    $file .= '.scss';
                }

                $clean = mb_substr($file, 1, -5);

                $result[$clean] = $dirname . $file;
            }
        }
    }


    return $result;
}

chdir(__DIR__);

$root = findRoot(__DIR__) . '/node_modules/animate-scss/';


$all = [
    'properties' => $root . '_properties.scss',
];

foreach (getImports($root . 'animate.scss') as  $file) {

    $all += getImports($file);
}

$index = [];
foreach ($all as $animation => $import) :


    $filename = basename($import);

    if ($animation === 'properties') {
        file_put_contents($filename, sprintf("@import '%s';", $import));
        continue;
    }

    file_put_contents($filename, sprintf("// %s\n@import 'properties';\n@import '%s';", $animation, $import));

    $index[] = sprintf("@forward '%s';", $filename);

endforeach;

file_put_contents('_index.scss', implode("\n", $index));
