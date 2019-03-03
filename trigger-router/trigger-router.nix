{ stdenv, lib, fetchFromGitHub, python3Packages }:
python3Packages.buildPythonApplication {
  pname = "silly-monkey-trigger-router";
  version = "0.1.0";

  src = ./.;

  propagatedBuildInputs = with python3Packages; [
    flask
    requests
    psycopg2 flask_sqlalchemy
    marshmallow
  ];

  meta = with stdenv.lib; {
    description = "Router for the Silly Monkey Personal Digital Assistant";
    license = licenses.bsd3;
    homepage = https://github.com/dhbw-stginf16a/silly-monkey;
    maintainers = with maintainers; [ johnazoidberg ];
    platforms = platforms.all;
  };
}
