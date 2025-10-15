---

````markdown
# ⚡ fastdlcli

> A fast, reliable Node.js CLI tool for downloading files — built for stability, simplicity, and speed.

---

## 🚀 Overview

**fastdlcli** lets you download files from the internet via command line without the typical browser slowdowns or broken downloads.  
It’s designed for consistent performance, automatic file naming, and clear progress indicators.

---

## 🧩 Features

- 📥 **Sequential Downloads** — ensures every file completes cleanly  
- ⚡ **Fast and Stable** — often faster than browsers, handles interruptions gracefully  
- 📊 **Progress Bar** — shows percentage, speed (MB/s), and ETA  
- 🧠 **Smart File Naming** — avoids overwriting existing files  
- 🪶 **Lightweight** — pure Node.js, no external dependencies  
- 🔒 **Non-Commercial Source Available License** (BSL 1.1)  

---

## 💻 Installation (Local Testing)

Clone your repo and set it up locally:

```bash
git clone https://github.com/yogeshu/fastdlcli.git
cd fastdlcli
npm link
````

This creates a global CLI command on your system called `fastdlcli`.

---

## 🧠 Usage

### Download a single file

```bash
fastdlcli https://example.com/file.zip
```

### Download multiple files

```bash
fastdlcli https://site.com/file1.mp4 https://site.com/file2.pdf
```

### Use a `downloads.txt` list

Create a text file named `downloads.txt` in the same folder:

```
https://example.com/file1.zip
https://example.com/file2.mp4
```

Then run:

```bash
fastdlcli
```

### Paste URLs interactively

If no arguments and no file exist, `fastdlcli` will ask you to paste URLs directly in terminal:

```
📥 Enter URLs (separated by space, comma, or newline):
> https://example.com/file1.zip https://example.com/file2.mp4
```

---

## 🧰 Input Priority

1. Command-line URLs
2. `downloads.txt` file
3. Interactive prompt

---

## 🧾 Output Example

```
🚀 Starting download of 2 file(s)...

example.mp4               [██████████----------] 60.23% | 4.8 MB/s | ETA: 0m 22s
✅ example.mp4 done in 12.31s (6.52 MB/s)

example.zip               [███████████████████-] 98.72% | 7.9 MB/s | ETA: 0m 1s
✅ example.zip done in 9.43s (8.11 MB/s)

🎉 Download finished: 2/2 successful.
```

---

## 🛠️ Project Structure

```
fastdlcli/
├── downloader.js          # main CLI script
├── package.json           # CLI metadata and bin setup
├── LICENSE                # Business Source License (BSL 1.1)
├── LICENSE-COMMERCIAL     # commercial license terms
├── SECURITY.md            # vulnerability reporting policy
└── CODE_OF_CONDUCT.md     # community standards
```

---

## ⚖️ License

**Business Source License 1.1 (BSL 1.1)**

* Free for personal, educational, and non-commercial use.
* Commercial or revenue-generating use requires a paid license.
* See [`LICENSE-COMMERCIAL`](./LICENSE-COMMERCIAL) for details.
* © 2025 Yogesh Bhavsar

---

## 📬 Contact & Support

For commercial licensing or bug reports, reach out via email:
**[yogeshbhavsar1994@gmail.com](mailto:yogeshbhavsar1994@gmail.com)**

---

## 💡 Future Enhancements

* [ ] Optional parallel downloads
* [ ] Resume interrupted downloads
* [ ] Output directory selection (`--out ./folder`)
* [ ] Cross-platform installer (Windows/macOS/Linux)

---

### ❤️ Acknowledgment

Built by **Yogesh Bhavsar**
Inspired by the simplicity of Node.js and the power of open source.

```

---

✅ **Highlights of this README:**
- Markdown-friendly with emoji headers (works great on GitHub)  
- Shows usage examples, input priority, output sample  
- Lists license, contact, and future roadmap clearly  
- Consistent with professional CLI open-source projects  

---

```
