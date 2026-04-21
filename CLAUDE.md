This is a personal website, although the user mostly uses it as a personal blog about research on deep learning and spiking neural networks.

If you are working in the _posts folder, this usually means the user is writing a blogpost. He color codes his variables and adds diagrams in the form of svgs generated through JavaScript files. Make sure to refer back to 2025-11-22-recurrent-bptt.md for an example of styling and conventions. The goal for implementing supporting artifacts is consistency between blogposts and clean centralized code.

## Math in Jekyll

- **Inline math**: Use single `$`, e.g. `$x^2$`. Never use `$$` for inline math.
- **Display math**: Use `\begin{equation}...\end{equation}` for standalone equations with labels.
- **Fallback**: Some things like `align`, multiple underbraces, etc. are bugged in Jekyll when wrapped with `\begin{equation}`. In those cases use `$$` instead for display math.
- **Negative space**: `\!` does not render and should never be used.

## Citations

Citations use a custom include system with two components:

- `_includes/cite.html` — renders an inline numbered citation link.
- `_includes/references.html` — renders the full reference list at the bottom of a post.

**How to use:**

1. Define references in the post's front matter:
   ```yaml
   references:
     - id: he2015
       text: 'K. He et al., "Delving Deep into Rectifiers," <i>ICCV</i>, 2015. <a href="https://...">paper</a>'
     - id: micheli2025
       text: 'A. Micheli et al., "Deep activity propagation...," <i>NICE</i>, 2025. <a href="https://...">doi</a>'
   ```

2. Cite inline with: `{% include cite.html key="he2015" %}`

3. Render the reference list at the bottom of the post with: `{% include references.html %}`

## General Notes
Don't use em-dashes. Use commas or restructure your sentences. When writing in the markdown files, the math notation has to conform to the stated rules and to the style of the document. However, when replying to the user in a chat window, there is no rendering support for math.