macro (::) {
  rule infix {
    $lhs:ident | [$rhs:expr]
  } => {
    $lhs.prototype[$rhs]
  }
  rule infix {
    $lhs:expr | $rhs:expr
  } => {
    $lhs.prototype.$rhs
  }
}

export ::;
