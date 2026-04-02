# How to Build SpineCPT Desktop with Claude Code

## Step 1: Install Claude Code

Open PowerShell (admin) and run:
```powershell
npm install -g @anthropic-ai/claude-code
```

Then authenticate:
```powershell
claude login
```

It opens your browser — sign in with your Anthropic account.

## Step 2: Set up the workspace

```powershell
mkdir "C:\Users\sapan\Documents\UMD Research\spinecpt-desktop"
cd "C:\Users\sapan\Documents\UMD Research\spinecpt-desktop"
```

Copy the existing app and build spec into this folder:
```powershell
copy "C:\Users\sapan\Documents\UMD Research\spinecpt-pro\src\App.jsx" .\existing-app.jsx
```

Also download the BUILDSPEC.md from Claude.ai and put it in this folder.

## Step 3: Launch Claude Code

```powershell
cd "C:\Users\sapan\Documents\UMD Research\spinecpt-desktop"
claude
```

## Step 4: Give it the build command

Paste this into Claude Code:

---

Read BUILDSPEC.md for the complete architecture spec. Read existing-app.jsx for the working implementation (2600 lines, single file). Your job is to decompose that into the modular file structure described in the spec while preserving ALL functionality. Build it file by file in the order specified. Start with package.json and data files, then modules, then Electron config, then React components. After each file, verify it imports correctly. When done, run npm install and npm run dev to test.

---

Claude Code will:
1. Read both files
2. Understand the architecture
3. Start creating files one by one
4. Install dependencies
5. Test the build

## Step 5: Iterate

If something breaks, just tell Claude Code:
- "Fix the error in analyzer.js"
- "The voice button isn't working"
- "Add modifier 62 logic to ncci.js"

It reads the error, finds the file, fixes it.

## Step 6: Package as .exe

Once working:
```
npm run build
```

This creates an installer in the `dist/` folder that you can send to anyone.

## Tips:
- Claude Code has full file system access — it creates, reads, and edits files directly
- It can run npm install, npm run dev, etc.
- It sees terminal output and can debug errors
- You can have it work on one module at a time or let it build everything
- If it gets confused, point it to a specific file: "Look at src/modules/analyzer.js and fix the import"
