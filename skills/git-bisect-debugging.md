# Git Bisect Debugging

**Category:** Debugging  
**Tier:** 2

## Skill Description

Use binary search through git history to pinpoint exactly which commit introduced a bug. This is the fastest way to find regressions in codebases with many commits.

## Instructions

When a feature that "used to work" is now broken:

1. **Find a known good commit** — Identify a commit where the feature definitely worked. This could be a release tag, a date you remember, or just "it worked last week."

2. **Start the bisect session:**

   ```bash
   git bisect start
   git bisect bad                 # Current HEAD is broken
   git bisect good <commit-hash>  # Mark the known good commit
   ```

3. **Test each checkpoint** — Git will checkout a commit halfway between good and bad. Test the feature:
   - If it works: `git bisect good`
   - If it's broken: `git bisect bad`
   - If you can't test (build fails, unrelated): `git bisect skip`

4. **Repeat until found** — Git will narrow down exponentially. For 1000 commits, you'll test ~10 times max.

5. **Examine the culprit:**

   ```bash
   git show              # See the breaking commit
   git bisect log        # Review your bisect history
   git bisect reset      # Return to original HEAD
   ```

6. **Automate if possible** — If you have a test that catches the bug:
   ```bash
   git bisect run npm test -- --grep "broken feature"
   ```

## Key Tips

- **Stash or commit local changes first** — Bisect checks out different commits
- **Use `git bisect skip`** — For commits that can't be tested (broken build, missing deps)
- **Write the test first** — If you can write a failing test, automate the entire bisect
- **Check merge commits** — Sometimes the bug is in how branches were merged, not the commits themselves

## Example Session

```bash
$ git bisect start
$ git bisect bad HEAD
$ git bisect good v2.1.0
Bisecting: 47 revisions left to test (roughly 6 steps)
[abc1234] Add user profile feature

# Test the feature... it's broken
$ git bisect bad
Bisecting: 23 revisions left to test (roughly 5 steps)

# ... repeat until ...
def5678 is the first bad commit
commit def5678
Author: dev@example.com
Date:   Mon Jan 15 10:30:00 2024

    Refactor auth middleware
```

## Copy-Paste Skill Text

```
Use git bisect to find regressions through binary search. Start with `git bisect start`, mark current as `bad` and a known working commit as `good`. Test each checkpoint Git provides, marking good/bad until the culprit is found. For ~1000 commits, you'll only test ~10 times. Automate with `git bisect run <test-command>` if you have a reproducible test. Always `git bisect reset` when done.
```
