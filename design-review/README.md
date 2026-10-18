# Portfolio local design experiment

Local branch: `codex/portfolio-designos-preview-20261017`. Base: `7e49790` from the existing six-route portfolio rebuild. The live site, `origin/main`, and the concurrently edited Persado-profile checkout differ from this base. This is a design preview, not a release candidate merged with those changes.

Direction and acceptance criteria are in `plan.json`. DesignOS audit and knowledge are used directly. Its Phase 3 automated plan/build/compare commands are still gated; agent roles implement this experiment explicitly. UI/UX Pro Max is consulted from the official reference checkout; Motion Primitives patterns are adapted in native CSS/JS, not installed as React packages.

Serve only on loopback:

```sh
python3 -m http.server 4175 --bind 127.0.0.1
```

Open <http://127.0.0.1:4175/>. No dependency install or build is needed.

No push or deployment is authorized by this experiment.

## October 18: executive content direction

The current pass preserves the visual system and the existing motion layer while leading with portfolio ownership, design leadership, commercialization, adoption, and enterprise change. The direction, sources and acceptance criteria are in `executive-content-plan.md`. The prior local files were preserved under the ignored `.designos/snapshots/before-executive-content-20261018-124507/` directory.

DesignOS now also has upstream component registries, a Motion/React playground and installed design skills. This portfolio remains a static HTML/CSS/JS implementation; no React migration or component installation was needed for the content pass.
