macro unless {
  rule {
    ( $predicate:expr ) return $body:expr ;
  } => {
    if (!($predicate)) {
      return $body
    }
  }
  rule {
    ( $predicate:expr ) { $body:expr (;) ... }
  } => {
    if (!($predicate)) {
      $body ...
    }
  }
  rule infix {
    return $wtvr:expr | $condition:expr ;
  } => {
    if (!($condition)) return $wtvr
  }
  rule infix {
    $body:expr | $condition:expr ;
  } => {
    $body unless $condition
  }
  rule infix {
    $body:expr | $condition:expr 
  } => {
    if (!($condition)) {
      $body
    }
  }
}

export unless;