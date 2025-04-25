{pkgs}: {
  deps = [
    pkgs.curl
    pkgs.nodejs-18_x
    pkgs.nodePackages.typescript-language-server
    pkgs.nodePackages.typescript
    pkgs.yarn
  ];
}
