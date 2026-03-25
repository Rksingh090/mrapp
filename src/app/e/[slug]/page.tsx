"use client";

import { useEffect, useState, useMemo, memo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createPortal } from "react-dom";

interface EventData {
  _id: string;
  title: string;
  steps: any[];
  pageConfig: any;
}

function PortalAnchor({ id, children }: { id: string; children: (container: HTMLElement) => React.ReactNode }) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById(id);
    if (el) setContainer(el);
  }, [id]);

  if (!container) return null;
  return createPortal(children(container), container);
}

const MemoTemplate = memo(({ html }: { html: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} className="h-full w-full" />;
});

MemoTemplate.displayName = "MemoTemplate";

export default function PublicEventForm() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Derive steps early for hook safety
  const steps = event?.steps || [];
  const currentStep = steps[currentStepIdx];
  const isLastStep = steps.length > 0 && currentStepIdx === steps.length - 1;

  // Memoize template processing
  const { processedHtml, fieldIds } = useMemo(() => {
    if (!currentStep?.templateHtml) return { processedHtml: "", fieldIds: [] };
    
    let html = currentStep.templateHtml;
    const placeholders = html.match(/\{\{field:(.*?)\}\}/g) || [];
    const ids = placeholders.map((p: string) => p.match(/\{\{field:(.*?)\}\}/)?.[1]).filter(Boolean) as string[];

    let processed = html;
    ids.forEach(id => {
      processed = processed.replace(new RegExp(`\\{\\{field:${id}\\}\\}`, 'g'), `<div id="mrapp-anchor-${id}" class="mrapp-inline-anchor"></div>`);
    });

    processed = processed.replace(/\{\{next\}\}/g, `<div id="mrapp-btn-next" class="mrapp-inline-anchor"></div>`);
    processed = processed.replace(/\{\{back\}\}/g, `<div id="mrapp-btn-back" class="mrapp-inline-anchor"></div>`);
    processed = processed.replace(/\{\{submit\}\}/g, `<div id="mrapp-btn-submit" class="mrapp-inline-anchor"></div>`);

    return { processedHtml: processed, fieldIds: ids };
  }, [currentStep?.templateHtml]);

  useEffect(() => {
    (window as any).mrapp_back = () => {
      if (currentStepIdx > 0) setCurrentStepIdx(currentStepIdx - 1);
    };
  }, [currentStepIdx]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${params.slug}`);
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (params.slug) fetchEvent();
  }, [params.slug]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const finalData = { ...formData };
      
      for (const step of steps) {
        for (const field of step.fields) {
          if (field.type === 'file' && formData[field.id] instanceof File) {
            const file = formData[field.id];
            const uploadData = new FormData();
            uploadData.append('file', file);
            
            const res = await fetch(`/api/upload-simple`, { 
              method: 'POST', 
              body: uploadData 
            });
            const { url } = await res.json();
            finalData[field.id] = url;
          }
        }
      }

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event?._id,
          data: finalData
        }),
      });
      const submission = await response.json();
      router.push(`/v/${submission._id}`);
    } catch (err) {
      alert("Error submitting. Please try again.");
      setSubmitting(false);
    }
  };

  const handleNext = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const stepFields = currentStep?.fields || [];
    for (const field of stepFields) {
      if (field.required && !formData[field.id]) {
        return alert(`${field.label} is required.`);
      }
    }

    if (!isLastStep) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      handleSubmit();
    }
  };

  const renderField = (fieldId: string) => {
    if (!currentStep) return null;
    const field = currentStep.fields.find((f: any) => f.id === fieldId);
    if (!field) return <span className="mrapp-error">Field &quot;{fieldId}&quot; not found</span>;

    return (
      <div key={field.id} className={`mrapp-field-wrapper mrapp-wrapper-${field.id}`}>
        <label htmlFor={field.id} className={`mrapp-field-label mrapp-input-${field.id}-label`}>{field.label}</label>
        {field.type === 'text' && (
          <input 
            type="text"
            id={field.id}
            name={field.id}
            required={field.required}
            value={formData[field.id] || ""}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            className={`mrapp-field-input mrapp-text-input mrapp-input-${field.id}`}
            placeholder={field.placeholder || "Type here..."}
          />
        )}
        {field.type === 'file' && (
           <div className={`mrapp-file-wrapper mrapp-input-${field.id}-container`}>
             <input 
               type="file"
               id={field.id}
               name={field.id}
               required={field.required}
               className={`mrapp-field-input mrapp-file-input mrapp-input-${field.id}`}
               onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setFormData({ ...formData, [field.id]: file });
               }}
             />
             {formData[field.id] && <span className="mrapp-file-selected-text">Selected: {formData[field.id].name}</span>}
           </div>
        )}
        {field.type === 'date' && (
          <input 
            type="date"
            id={field.id}
            name={field.id}
            required={field.required}
            value={formData[field.id] || ""}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            className={`mrapp-field-input mrapp-date-input mrapp-input-${field.id}`}
          />
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    if (!currentStep) {
      return (
        <div className="space-y-8 flex items-center justify-center p-8 text-white">
           <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No configuration available for this step.</p>
        </div>
      );
    }

    if (!currentStep.templateHtml) {
      return (
        <div className="space-y-8 p-8 bg-black/30 backdrop-blur-xl rounded-4xl border border-white/5 max-w-lg mx-auto m-12">
           {currentStep.fields.map((field: any) => (
              <div key={field.id}>{renderField(field.id)}</div>
           ))}
        </div>
      );
    }

    return (
      <div className="custom-step-html h-full w-full">
        <MemoTemplate html={processedHtml} />
        {fieldIds.map(id => id && (
          <PortalAnchor key={id} id={`mrapp-anchor-${id}`}>
             {() => renderField(id)}
          </PortalAnchor>
        ))}
        <PortalAnchor id="mrapp-btn-next">
          {() => (
            <button type="submit" className="mrapp-next-btn mrapp-generated-btn mrapp-button-next">Next Step</button>
          )}
        </PortalAnchor>
        <PortalAnchor id="mrapp-btn-back">
          {() => (
            <button type="button" onClick={() => (window as any).mrapp_back?.()} className="mrapp-back-btn mrapp-generated-btn mrapp-button-back">Go Back</button>
          )}
        </PortalAnchor>
        <PortalAnchor id="mrapp-btn-submit">
          {() => (
            <button type="submit" disabled={submitting} className="mrapp-submit-btn mrapp-generated-btn mrapp-button-submit">
              {submitting ? "Processing..." : "Finalize Submit"}
            </button>
          )}
        </PortalAnchor>
        <style jsx global>{`
          .mrapp-inline-anchor { display: contents; }
        `}</style>
      </div>
    );
  };

  if (loading) return (
    <div className="mrapp-loading" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
       <p>Loading...</p>
    </div>
  );

  if (!event) return (
    <div className="mrapp-error-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
       <h1>Event Not Found</h1>
       <button onClick={() => router.push('/')}>Return Home</button>
    </div>
  );

  const hasCustomButtons = currentStep?.templateHtml?.match(/\{\{next\}\}|\{\{back\}\}|\{\{submit\}\}|mrapp-next-btn|mrapp-back-btn|mrapp-submit-btn/);

  return (
    <div className="mrapp-page-container w-full min-h-screen" style={{ backgroundColor: event.pageConfig?.backgroundColor || 'transparent' }}>
      <form onSubmit={handleNext} className="mrapp-form w-full h-full m-0 p-0">
        <div className="mrapp-step-content w-full h-full">
           {renderStepContent()}
        </div>

        {!hasCustomButtons && (
          <div className="mrapp-actions" style={{ padding: '20px', textAlign: 'center' }}>
            <button type="submit" disabled={submitting} className="mrapp-submit-btn">
              {submitting ? "Processing..." : (isLastStep ? "Finalize Submit" : "Next Step")}
            </button>
            {currentStepIdx > 0 && (
              <button type="button" onClick={() => setCurrentStepIdx(currentStepIdx - 1)} className="mrapp-back-btn" style={{ marginLeft: '10px' }}>
                Go Back
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
