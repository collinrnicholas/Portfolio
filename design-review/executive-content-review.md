# Content and migration review — October 18, 2026

The local portfolio now uses the cleaner design to present an executive product story. Its current title is Director of Product at Persado; the evidence and scope carry the leadership positioning.

| Area | Previous local emphasis | Revised emphasis |
| --- | --- | --- |
| First impression | Independent product screenshot, individual execution, problem-to-revenue claim | Product leadership from strategy to customer value; current growth, retention and design remit |
| Page order | Independent products before current corporate leadership | Current portfolio, enterprise outcomes, leadership approach, then independent products |
| Proof | Three financial figures and newer unsupported independent-product efficiency claims | Three different proof lenses: commercialization, adoption, enterprise change |
| Work | Independent builds first; incomplete current-role anchor | Persado first with a working `#persado` anchor, attributed enterprise evidence, independent products |
| About | Personal execution and product cost | Portfolio direction, design and cross-functional delivery; historical team leadership attributed to MicroStrategy |
| Project stories | Build details and broad outcome assertions | Customer task, product decision, evidence and accurate status |

The historical figures are attributed to Jobvite/Employ rather than Persado: shared-service ARR in its first year, Candidate Texting year-over-year activity and volume, and a nine-month enterprise UI rollout. Current Persado programs are described as responsibilities, not as newly measured commercial results. The detailed Work page retains screening-suite, renewal, adoption, GTM and responsible-AI evidence.

The factual baseline is the current [live portfolio](https://collinnicholas.com/) and the existing current public resume. The source profile checkout is `/Users/test/dev/collinnicholas-project-links-20261017` at `8683b86` when inspected. The current local resume was not edited in this pass. New local time-saving and renewal-causality claims were preserved in the before snapshot and omitted from this version because their evidence was not in those sources.

The owner then supplied additional leadership scope directly in this chat: current direct management of Persado's design team; changes to product–engineering delivery and collaboration; about ten historical MicroStrategy direct reports; and Employ partner relationships including $600K+ in Twilio spend plus ID.me, VONQ and ProboTalent. Those facts are now prominent in Home, Work and About. No annual spend period or quantified delivery improvement was supplied or inferred. The older resume's team figure remains in the unchanged PDF and should be reviewed during any full-profile release.

## What stays from the approved design

The palette, typography, artifact frames, equal project grid, real PM Toolkit screens, mobile menu and motion styles remain. The first artifact now explains current leadership scope. Real product screenshots and the user-driven artifact tabs remain in the independent-work section. `css/executive.css` supplies the new scope map and portfolio row, plus full-opacity hero entry styles for readable contrast throughout the animation.

## Validation

The final independent validation passes all four executive-content criteria. All six pages load at desktop, tablet and mobile sizes; no 320px overflow, missing assets, browser errors or serious/critical accessibility violations were found. Keyboard navigation, artifact tabs, no-JavaScript content and live reduced-motion changes pass. The final interaction pass also verifies mobile-menu focus and cancellation of active number animations.

See [final independent validation](executive-independent-validation-final.json). DesignOS audit `20261018-125908-collinnicholas-audit-qqzl` captured 18/18 views with no critical, high or objective findings; six heuristic style advisories remain. A minor existing figure/tabpanel ARIA warning and the resume's older team-scope figure remain documented for release review. These checks do not represent a claim of universal accessibility or design perfection.

## Path to the real site

This is validated and ready for local review at <http://127.0.0.1:4175/>. It is not published.

The preview branch starts from the older six-route rebuild at `7e49790` and includes uncommitted design and content work from this session and subsequent local work. The current live content is newer. Before publishing:

1. Use a clean release worktree from the then-current production branch and reconcile the complete preview design with the current live content. Keep the six routes, required CSS/JS/assets, current resume and new navigation together; copying only `index.html` would be incomplete.
2. Re-run the six-route desktop/tablet/mobile checks, local-fragment navigation, keyboard interactions, reduced motion and asset checks against that release worktree. Check the public project links and professional facts one final time.
3. Push and publish only after the owner authorizes that release. Then verify the deployed pages and resources match the released files.

No push, deployment, remote branch change or modification to the live-source checkout was performed for this content pass.

## DesignOS library inventory

The current registry and installed playground include Motion Primitives, Magic UI and React Bits selections; Motion for React is an installed package; UI/UX Pro Max is a vendored and installed skill. They are selective integrations rather than full GitHub forks. Ether Boilerplate is absent from the current catalog. See `/Users/test/dev/designos/registry/upstream.json` for the verified local inventory; adding more sources is separate from this portfolio content pass.
