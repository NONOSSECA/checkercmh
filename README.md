<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Extract Domain</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #f0f0f0;
        }
        input, button {
            padding: 10px;
            margin: 5px;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <h1>Extract Domain from URL</h1>
    <input type="text" id="urlInput" placeholder="Enter URL here">
    <button onclick="extractDomain()">Extract Domain</button>
    <p id="result"></p>

    <script>
        function extractDomain() {
            const urlInput = document.getElementById('urlInput').value;
            try {
                const url = new URL(urlInput);
                const domain = url.hostname;
                document.getElementById('result').innerText = `Domain: ${domain}`;
            } catch (error) {
                document.getElementById('result').innerText = 'Invalid URL';
            }
        }
    </script>
</body>
</html>
