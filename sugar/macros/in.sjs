// https://github.com/locks/candyshop


macro (in?) {
  rule infix {
    $lhs:expr | $rhs:expr
  } => {
    !!~$rhs.indexOf($lhs)
  }
}

export (in?);
