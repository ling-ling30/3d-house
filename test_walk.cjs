const { spawn } = require('child_process');
const fs = require('fs');

async function testWalk() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    'http://localhost:5173/'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9222/json');
  const tabs = await res.json();
  const target = tabs.find(t => t.url.includes('localhost:5173'));
  const ws = new WebSocket(target.webSocketDebuggerUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({
      id: 2,
      method: 'Runtime.evaluate',
      params: {
        expression: `
          window.houseApp.setMode('walk');
          ({
            mode: window.houseApp.mode,
            camPos: {
              x: window.houseApp.camera.position.x,
              y: window.houseApp.camera.position.y,
              z: window.houseApp.camera.position.z
            },
            rot: {
              x: window.houseApp.camera.rotation.x,
              y: window.houseApp.camera.rotation.y,
              z: window.houseApp.camera.rotation.z
            },
            fpsEnabled: window.houseApp.fpsController.enabled,
            ceilingVis: window.houseApp.houseResult.ceilingGroup.visible
          })
        `,
        returnByValue: true
      }
    }));

    setTimeout(() => {
      ws.send(JSON.stringify({ id: 3, method: 'Page.captureScreenshot' }));
    }, 1500);
  };

  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.id === 2) {
      console.log('Walk eval result:', JSON.stringify(d.result, null, 2));
    } else if (d.id === 3) {
      if (d.result && d.result.data) {
        fs.writeFileSync('walk_capture.png', Buffer.from(d.result.data, 'base64'));
        console.log('Saved walk_capture.png! Size:', fs.statSync('walk_capture.png').size);
      }
      ws.close();
      chrome.kill();
      process.exit(0);
    } else if (d.method === 'Runtime.exceptionThrown') {
      console.error('EXCEPTION:', d.params);
    }
  };
}

testWalk();
