macro str {
    case {_ $template } => {
        var temp = #{$template}[0];
        var tempString = temp.token.value.raw;
        letstx $newTemp = [makeValue(tempString, #{here})];
        return #{$newTemp}
    }
}

export str;
// str `foo bar baz`