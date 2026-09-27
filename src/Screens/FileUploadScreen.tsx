import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { fileUploadStyles as s } from "../styles/fileUpload";
import Topbar from "./IntroduceScreen/Topbar";
import FileInputBox from "../components/FileDropInput";
// SbomApi에서 만든 uploadSbomFile 함수 가져오기
import { uploadSbomFile } from "../services/_private/SbomApi";
import { isLoggedIn } from "../utils/currentUser";

export default function FileUploadScreen() {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);

  const handleFilesChange = (files: File[]) => {
    // 파일 선택했을 때 (아직 업로드 안함)
    console.log("선택된 파일:", files);
  };

  const handleAnalyze = async (files: File[]) => {
    // 분석 시작 버튼 눌렀을 때 실제 업로드
    if (files.length === 0) return;
    if (isUploading) return;

    setIsUploading(true);

    try {
      if (!isLoggedIn()) {
        alert("로그인 후 파일을 분석할 수 있습니다.");
        navigate("/login");
        return;
      }

      // 여러 파일 선택했을 경우 하나씩 순서대로 업로드
      // 전부 올린 뒤에 이동해야 나머지 파일이 화면 밖에서 업로드되지 않음
      const uploadedSeqs: number[] = [];
      for (const file of files) {
        // SbomApi.ts의 uploadSbomFile 호출
        // file → 실제 파일
        const result = await uploadSbomFile(file);

        if (result.success) {
          // 백엔드에서 success: true 오면 성공
          const fileSeq = result.data?.fileSeq;
          if (fileSeq) {
            uploadedSeqs.push(fileSeq);
          } else {
            alert(
              `${file.name} 업로드는 성공했지만 분석 결과 번호를 받지 못했습니다. 백엔드가 최신 코드로 재시작됐는지 확인해주세요.`,
            );
          }
        } else {
          // 백엔드에서 success: false 오면 실패
          alert(`${file.name} 업로드 실패: ${result.message}`);
        }
      }

      // 1개면 해당 파일 로딩 화면으로, 여러 개면 히스토리에서 한 번에 확인
      if (uploadedSeqs.length === 1) {
        navigate(`/scan-loading/${uploadedSeqs[0]}`);
      } else if (uploadedSeqs.length > 1) {
        alert(`${uploadedSeqs.length}개 파일 업로드 완료. 분석 히스토리에서 결과를 확인하세요.`);
        navigate("/history");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main style={s.page}>
      <Topbar />

      <div style={s.content}>
        <button type="button" style={s.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          뒤로
        </button>
        <h1 style={s.title}>파일 분석</h1>
        <p style={s.subTitle}>
          SBOM 또는 프로젝트 ZIP을 업로드하면 오픈소스 구성요소를 식별하고, 알려진
          취약점(CVE)을 찾아 배포 가능 여부를 판정합니다.
        </p>

        {/* FileInputBox에서 파일 선택하면 handleFilesChange 실행 */}
        <FileInputBox
          multiple
          isUploading={isUploading}
          onFilesChange={handleFilesChange}
          onAnalyze={handleAnalyze}
        />

        <ul style={s.tips}>
          <li style={s.tip}>
            <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            ZIP으로 올리면 구성요소를 자동으로 추출하고, 수정 버전이 있는 npm 패키지는 자동 수정
            ZIP을 받을 수 있습니다.
          </li>
          <li style={s.tip}>
            <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            파일을 여러 개 올리면 모두 업로드한 뒤 분석 히스토리에서 결과를 한 번에 확인합니다.
          </li>
        </ul>
      </div>
    </main>
  );
}
