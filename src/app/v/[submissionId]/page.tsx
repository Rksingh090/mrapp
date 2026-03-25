"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import canvasConfetti from "canvas-confetti";

export default function VisualAdPage() {
  const params = useParams();
  const [event, setEvent] = useState<any>(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const renderAd = async () => {
      try {
        const submissionRes = await fetch(`/api/submissions?id=${params.submissionId}`);
        const submission = await submissionRes.json();
        
        const eventRes = await fetch(`/api/events/${submission.eventId}`);
        const eventData = await eventRes.json();
        setEvent(eventData);

        let filledHtml = eventData.templateHtml;
        
        // Add download button replacement
        filledHtml = filledHtml.replace(
          /\{\{download_button\}\}/g, 
          '<button id="download-btn-placeholder" class="mrapp-download-btn mrapp-button-download_button" data-html2canvas-ignore="true">Download</button>'
        );
        
        // Dynamic replacement based on data map
        const dataMap = submission.data;
        Object.keys(dataMap).forEach(key => {
          const val = dataMap[key];
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          filledHtml = filledHtml.replace(regex, val);
        });

        setHtmlContent(filledHtml);

        // Trigger confetti if enabled
        if (eventData.pageConfig?.showConfetti) {
          setTimeout(() => {
            canvasConfetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: [eventData.pageConfig.primaryColor, '#ffffff', '#ffd700']
            });
          }, 500);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.submissionId) renderAd();
  }, [params.submissionId, router]);

  const config = event?.pageConfig || {};

  useEffect(() => {
    const handleDownload = async () => {
      const btn = document.getElementById("download-btn-placeholder");
      const fallbackBtn = document.getElementById("fallback-download-btn");
      const customBtn = document.querySelector(".mrapp-download-btn");
      const activeBtn = (btn || fallbackBtn || customBtn) as HTMLElement;
      
      if (activeBtn) {
        if (!activeBtn.hasAttribute('data-original-text')) {
          activeBtn.setAttribute('data-original-text', activeBtn.innerHTML);
        }
        activeBtn.innerHTML = "Downloading...";
        activeBtn.style.opacity = "0.5";
      }

      const content = document.getElementById('ad-capture-area');
      if (!content) return;

      try {
        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(content as HTMLElement, {
          useCORS: true,
          scale: 2,
          backgroundColor: config.backgroundColor || null
        });
        const link = document.createElement('a');
        link.download = `event-${params.submissionId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error("Download failed", error);
        alert("Failed to download image.");
      } finally {
        if (activeBtn) {
          activeBtn.innerHTML = (activeBtn.id === "download-btn-placeholder" || activeBtn.id === "fallback-download-btn") ? "Download" : (activeBtn.getAttribute('data-original-text') || activeBtn.innerHTML);
          activeBtn.style.opacity = "1";
        }
      }
    };

    const btn = document.getElementById("download-btn-placeholder");
    const fallbackBtn = document.getElementById("fallback-download-btn");
    const customBtns = document.querySelectorAll(".mrapp-download-btn");

    if (btn) btn.addEventListener("click", handleDownload);
    if (fallbackBtn) fallbackBtn.addEventListener("click", handleDownload);
    customBtns.forEach(b => b.addEventListener("click", handleDownload));

    return () => {
      if (btn) btn.removeEventListener("click", handleDownload);
      if (fallbackBtn) fallbackBtn.removeEventListener("click", handleDownload);
      customBtns.forEach(b => b.removeEventListener("click", handleDownload));
    };
  }, [htmlContent, params.submissionId, config.backgroundColor]);

  if (loading) return (
    <div className="mrapp-loading" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
       <p>Generating Masterpiece...</p>
    </div>
  );

  const hasDownloadPlaceholder = htmlContent.includes('download-btn-placeholder') || htmlContent.includes('mrapp-download-btn');

  return (
    <div 
      className="mrapp-v-container w-full min-h-screen"
      id="ad-capture-area"
      style={{ 
        backgroundColor: config.backgroundColor || 'transparent',
      }}
    >
       <div dangerouslySetInnerHTML={{ __html: htmlContent }} className="mrapp-custom-html w-full" />

       {/* No more fallback button - only shows if {{download_button}} is in template */}
    </div>
  );
}
