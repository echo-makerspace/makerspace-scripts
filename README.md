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

## How to use

**PS:** You need to prefix these commands with `yarn`.

Now, to use this you first need to log in using `clasp login`. In our case you
need access to our administrator account for this to work as the scripts need to
run on any spreadsheet. After you've logged in you can run `clasp list` to list
the projects that is under the account.

In each package there needs to be a `.clasp.json` file containing a secret
project ID and a source folder. I've included an example in both directories on
how it should look.

To create a new package, just copy one of the existing ones into a new
directory. It is by far the easiest. Then in your Google Sheet, go to Tools,
Script Editor and create a new project. It should then show up in your `clasp
list` output, if it doesn't then in the script editor go to File, Project
properties and look for the ID there.

Finally, to make sure that there are no secrets commited to this repository
there are a few environment variables that needs to be added. You can do this in
the Script properties tab, add them as required. By default we use
`PROD_WEBHOOK`, `TEST_WEBHOOK`, `PROD_CHANNEL` and `TEST_CHANNEL`.

# LICENSE

MIT
