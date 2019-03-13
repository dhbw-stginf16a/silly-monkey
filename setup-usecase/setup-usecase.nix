{ stdenv, lib, fetchFromGitHub, python3Packages }:
python3Packages.buildPythonApplication {
  pname = "silly-monkey-setup-usecase";
  version = "0.1.0";

  src = ./.;

  propagatedBuildInputs = with python3Packages; [
    flask
    requests
  ];

  meta = with stdenv.lib; {
    description = "Setup usecase for the Silly Monkey Personal Digital Assistant";
    license = licenses.bsd3;
    homepage = https://github.com/dhbw-stginf16a/silly-monkey;
    maintainers = with maintainers; [ johnazoidberg ];
    platforms = platforms.all;
  };
}
