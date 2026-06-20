#!/bin/bash

cd "d:\TRNT BEE\BEE SOCIETY\UNIPLAY.worktrees\agents-fix-and-update-unigames-repo"

git add -A

git commit -m "style: fix text visibility issues with theme-aware text-shadow colors

- Changed h1, h2, h3 text-shadow from solid black to semi-transparent rgba
- Added light theme specific text-shadows with white rgba
- Added gaming theme specific text-shadows with darker rgba
- This resolves contrast issues where text was becoming invisible in profile and lobby sections

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

git log --oneline -1
