macro lambda {
  rule { ($args (,) ...) { $body ... } } => {
    (function ($args (,) ...) {
      $body ...
    })
  }
}

export lambda;

/*
lambda () {
  var x = 2, y = 5;
  console.log('hello');
}

=>

(function () {
    var x = 2, y = 5;
    console.log('hello');
});
*/