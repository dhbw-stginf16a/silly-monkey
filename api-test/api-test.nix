{ stdenv, lib, fetchFromGitHub, python3Packages }:
python3Packages.buildPythonApplication {
  pname = "silly-monkey-api-test";
  version = "0.1.0";

  src = ./.;

  propagatedBuildInputs = with python3Packages; [
    tavern
  ];

  meta = with stdenv.lib; {
    description = "Integration tests for the Silly Monkey Personal Digital Assistant";
    license = licenses.bsd3;
    homepage = https://github.com/dhbw-stginf16a/silly-monkey;
    maintainers = with maintainers; [ johnazoidberg ];
    platforms = platforms.all;
  };
}
