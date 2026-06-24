<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>SVG to PNG 변환기</title>
    <style>
        body { font-family: sans-serif; padding: 20px; }
        .box { border: 1px dashed #ccc; padding: 20px; margin-bottom: 10px; display: inline-block; }
        button { padding: 10px 20px; font-size: 16px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px; }
        button:hover { background: #0056b3; }
    </style>
</head>
<body>

  <h3>1. 원본 SVG (화면에 있는 것)</h3>
  <div class="box">
    <svg id="my-svg" width="200" height="200" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="royalblue" />
      <text x="50" y="55" font-size="12" fill="white" text-anchor="middle" font-family="Arial">SVG</text>
    </svg>
  </div>

  <br>
  <button id="convert-btn">PNG로 변환 후 다운로드</button>

  <script>
    document.getElementById('convert-btn').addEventListener('click', async () => {
      const svgElement = document.getElementById('my-svg');
      
      // 1. SVG 원본 크기 가져오기
      const width = svgElement.clientWidth || 200;
      const height = svgElement.clientHeight || 200;

      // 2. SVG를 문자열로 변환 (Serialization)
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);

      // 3. SVG 문자열을 Blob 객체로 만들고 고유 URL 생성
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = URL.createObjectURL(svgBlob);

      // 4. 가상의 Image 객체 생성 및 SVG 연결
      const image = new Image();
      image.src = blobURL;

      // 5. 이미지가 브라우저 메모리에 완전히 로드되었을 때 실행
      image.onload = () => {
        // 6. 가상의 Canvas 생성 및 크기 설정
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');

        // 7. Canvas에 SVG 이미지 그리기
        context.drawImage(image, 0, 0, width, height);

        // 8. Canvas의 내용을 PNG(Data URL)로 추출
        const pngDataUrl = canvas.toDataURL('image/png');

        // 9. 브라우저에서 자동으로 다운로드 시키기
        const downloadLink = document.createElement('a');
        downloadLink.href = pngDataUrl;
        downloadLink.download = 'converted_image.png'; // 저장될 파일명
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // 10. 사용한 메모리(Blob URL) 해제
        URL.revokeObjectURL(blobURL);
      };
    });
  </script>

</body>
</html>