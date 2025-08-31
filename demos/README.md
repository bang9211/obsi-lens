# 🎬 Obsi-Lens Plugin Demo Materials

이 폴더에는 Obsi-Lens 플러그인의 기능을 보여주는 데모 이미지들이 포함되어 있습니다.

## 📸 Demo Screenshots

### 플러그인 핵심 기능 시연
- **image_sample1.png** - 기본 이미지 뷰어 인터페이스
- **image_sample2.png** - 드로잉 도구 사용 예시 (빨간 선 그리기)
- **image_sample3.png** - 추가 기능 시연

### 이미지 편집 기능 
- **image_crop1.png** - 이미지 크롭 기능
- **image_crop2.png** - 고급 편집 도구

### Playwright 자동화 스크린샷
- **obsidian-appearance-page.png** - Obsidian Help 사이트 전체 화면
- **demo-obsidian-*.png** - 브라우저 자동화로 캡처한 요소들

## 🎯 주요 기능 하이라이트

### 1. 풀스크린 이미지 뷰어
- 이미지 클릭 시 전체화면 모달 오픈
- 깔끔한 다크 테마 인터페이스
- 직관적인 컨트롤 버튼

### 2. 고급 드로잉 도구
- **펜 도구**: 자유로운 선 그리기 (색상/두께 조절)
- **텍스트 도구**: 이미지에 텍스트 추가
- **지우개**: 드로잉 요소 삭제
- **실시간 미리보기**: 그리는 동안 즉시 반영

### 3. 이미지 조작 기능
- **줌/팬**: 마우스 휠과 드래그로 확대/이동
- **회전**: R 키로 90도 회전
- **스마트 복사**: Ctrl+C로 클립보드 복사

### 4. 네비게이션
- **키보드 단축키**: 화살표 키로 다음/이전 이미지
- **다중 이미지 지원**: 여러 이미지 간 빠른 전환
- **ESC**: 뷰어 닫기

## 🛠️ 기술적 특징

- **단일 파일 아키텍처**: main.ts (1,200+ 라인)
- **HTML5 Canvas**: 드로잉 시스템
- **좌표계 변환**: 줌/팬/회전 동기화
- **언두/리두 시스템**: 드로잉 히스토리 관리
- **팝아웃 윈도우**: 다중 윈도우 지원

## 📋 사용 가이드

### 설치 방법
```bash
# 1. 플러그인 빌드
make build

# 2. Obsidian에서 활성화
Settings → Community Plugins → Obsi-Lens 활성화
```

### 기본 사용법
1. 이미지 클릭 → 뷰어 오픈
2. 드로잉 도구 선택 → 이미지에 주석 추가
3. 키보드 단축키로 빠른 조작
4. ESC로 뷰어 닫기

## 🎨 데모 활용 방안

### README.md 업데이트
이 이미지들을 사용하여 README의 스크린샷 섹션을 개선할 수 있습니다:

```markdown
## Screenshots

### Basic Image Viewer
![Basic Viewer](demos/image_sample1.png)

### Drawing Tools in Action  
![Drawing Demo](demos/image_sample2.png)

### Advanced Features
![Advanced Features](demos/image_sample3.png)
```

### 문서화
- 사용자 가이드에 실제 사용 예시 포함
- 기능별 스크린샷으로 시각적 설명 강화
- 튜토리얼 제작 시 참고 자료로 활용

---

*이 데모 자료들은 Playwright 자동화와 실제 플러그인 사용을 통해 생성되었습니다.*