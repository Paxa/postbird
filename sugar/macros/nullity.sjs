macro null_helper {
    rule {($processed ...) ($rest)} => {
        $processed (.) ... . $rest
    }
    rule {($processed ...) ($rest_head $rest ...)} => {
        $processed (.) ... . $rest_head
        && null_helper ($processed ... $rest_head) ($rest ...)
    }
}
 
macro nullity {
    rule {($x)} => {
        $x
    }
    rule {($head . $rest (.) ...)} => {
        $head && null_helper ($head) ($rest ...)
    }
}

export nullity;