## WhisperFlow Setup

SpineCPT now expects a local WhisperFlow service for low-latency dictation in Electron.

Default endpoints:
- Health: `http://127.0.0.1:8181/health`
- WebSocket: `ws://127.0.0.1:8181/ws`

You can override the base URL with:

```powershell
$env:WHISPER_FLOW_BASE_URL="http://127.0.0.1:8181"
```

WhisperFlow prerequisites:
- Python 3.8+
- PortAudio / PyAudio support

Basic startup flow from the upstream project:

```bash
git clone https://github.com/dimastatz/whisper-flow.git
cd whisper-flow
# follow the upstream README to create the venv and start the server
```

The app only enables WhisperFlow dictation when the health endpoint responds successfully.
