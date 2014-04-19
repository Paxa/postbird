macro puts {
  rule { $x:expr (,) ... } => {
    console.log($x (,) ...);
  }
}

macro p {
  rule { $x:expr (,) ... } => {
    console.dir($x (,) ...);
  }
}

export puts;
export p;