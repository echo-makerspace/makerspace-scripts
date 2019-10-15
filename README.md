# makerspace-scripts

An assorted collection of scripts used by echo makerspace for managing members,
breaking things and general hacking.

## How

This repository is managed as a yarn workspace. This is done because `clasp` (a
TS->Google Script transpiler has no way of managing multiple projects in the
same package.

## Packages

- `new-members`: A small script that automatically sends a message to our
  channel when a new member wants to join the Makerspace.
- `3d-printing`: Another small scripts that notifies us when a member requests
  to do our 3D-printing course.

# LICENSE

MIT
