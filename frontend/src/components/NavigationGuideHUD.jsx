import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  Target,
  RotateCcw,
  Trophy,
  ArrowRight,
  Info
} from 'lucide-react';
import { evaluateAnalysisUnlockCriteria } from '../utils/analysisUnlockCriteria';
import './NavigationGuideHUD.css';

/**
 * Web Audio API Sci-Fi Sound Synthesizer
 * Zero external audio files, pure browser synthesis
 */
const playTacticalSound = (type = 'next', isMuted = false) => {
  if (isMuted) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'next') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(920, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'complete') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.07);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.14);
        o.start(ctx.currentTime + idx * 0.07);
        o.stop(ctx.currentTime + idx * 0.07 + 0.14);
      });
    } else if (type === 'skip') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    }
  } catch (e) {
    // Audio Context might be blocked or inactive
  }
};

export default function NavigationGuideHUD({
  currentStep = 0,
  onNextStep,
  onPrevStep,
  onSkip,
  onRestart,
  patientProfile,
  canvasFamilyMembers = [],
  formValues = {},
  predictionResults = {},
  activeTab,
  activeModule
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [targetRect, setTargetRect] = useState(null);

  // Evaluate Unlocking Criteria for HUD feedback
  const unlockCriteria = evaluateAnalysisUnlockCriteria(
    patientProfile,
    formValues,
    predictionResults,
    canvasFamilyMembers
  );

  // Define the 10 Guided Tour Highlights (Navigates through all 5 disease models one-by-one)
  const STEPS = [
    {
      id: 'profile',
      stageNum: '01',
      badge: 'PATIENT PROFILE',
      title: 'Patient Biological Profile',
      targetSelector: '#guide-patient-profile',
      instruction:
        'This card stores your global baseline biometrics: Age, Sex, Height, Weight, and BMI. Once entered, GeneGuard automatically synchronizes these values across all 5 disease models without repetitive typing.',
      hint: 'Highlighted: Personal Biological Profile card.',
      actionLabel: 'Move Forward'
    },
    {
      id: 'upload',
      stageNum: '02',
      badge: 'UPLOAD REPORT',
      title: 'Clinical Lab Report Upload',
      targetSelector: '#guide-upload-btn',
      fallbackSelector: '#guide-header-upload-btn',
      instruction:
        'Use this button to upload blood tests, metabolic panels, or pathology reports (PDF/images). GeneGuard extracts verified biomarkers and automatically routes them to the relevant disease prediction forms.',
      hint: 'Highlighted: Upload Lab Report button.',
      actionLabel: 'Move Forward'
    },
    {
      id: 'autofill',
      stageNum: '03',
      badge: 'AUTO FILL',
      title: 'Fill Reference Biomarkers',
      targetSelector: '#guide-autofill-btn',
      instruction:
        'Clicking this button quickly populates standard healthy clinical reference telemetry into missing inputs for quick testing and baseline comparison, while strictly preserving your patient profile.',
      hint: 'Highlighted: Fill Normal / Demo Values button.',
      actionLabel: 'Move Forward'
    },
    {
      id: 'cardiovascular',
      stageNum: '04',
      badge: 'MODEL 1 / 5',
      title: 'Cardiovascular Disease Model',
      targetSelector: '#guide-disease-card-cardiovascular',
      fallbackSelector: '#guide-dynamic-input-form',
      instruction:
        'Model 1 evaluates coronary artery disease and ischemic cardiac risk vectors. Analyzes systolic & diastolic blood pressure (ap_hi/ap_lo), total cholesterol, glucose, smoking, and physical activity.',
      hint: 'Highlighted: Cardiovascular disease module & telemetry form.',
      actionLabel: 'Move Forward'
    },
    {
      id: 'metabolic',
      stageNum: '05',
      badge: 'MODEL 2 / 5',
      title: 'Type 2 Diabetes & Metabolic Model',
      targetSelector: '#guide-disease-card-metabolic',
      fallbackSelector: '#guide-dynamic-input-form',
      instruction:
        'Model 2 evaluates insulin resistance and glycemic dysregulation. Analyzes fasting glucose, HbA1c, fasting insulin, body fat %, waist circumference, and lipid ratios (LDL/HDL/Triglycerides).',
      hint: 'Highlighted: Metabolic & Diabetes module & telemetry form.',
      actionLabel: 'Move Forward'
    },
    {
      id: 'blood_pressure',
      stageNum: '06',
      badge: 'MODEL 3 / 5',
      title: 'Hypertension & Hemodynamic Model',
      targetSelector: '#guide-disease-card-blood_pressure',
      fallbackSelector: '#guide-dynamic-input-form',
      instruction:
        'Model 3 assesses arterial tension and secondary hypertension. Evaluates systolic/diastolic pressure, salt intake, chronic stress level, physical exertion, kidney indicators, and genetic coefficient.',
      hint: 'Highlighted: Hypertension module & telemetry form.',
      actionLabel: 'Move Forward'
    },
    {
      id: 'thyroid',
      stageNum: '07',
      badge: 'MODEL 4 / 5',
      title: 'Thyroid Endocrine Model',
      targetSelector: '#guide-disease-card-thyroid',
      fallbackSelector: '#guide-dynamic-input-form',
      instruction:
        'Model 4 evaluates the hypothalamic-pituitary-thyroid axis. Incorporates clinical laboratory telemetry for TSH, T3, Total Thyroxine (TT4), T4 Uptake (T4U), and Free Thyroxine Index (FTI) to detect thyroid dysfunction.',
      hint: 'Highlighted: Thyroid Disorder module & endocrine report section.',
      actionLabel: 'Move Forward'
    },
    {
      id: 'cancer',
      stageNum: '08',
      badge: 'MODEL 5 / 5',
      title: 'Oncology & Cellular Cytology Model',
      targetSelector: '#guide-disease-card-cancer',
      fallbackSelector: '#guide-dynamic-input-form',
      instruction:
        'Model 5 predicts breast tumor malignancy vs. benign classification based on fine needle aspirate (FNA) cellular morphometry (radius, texture, perimeter, area, smoothness, compactness, concavity).',
      hint: 'Highlighted: Oncology module & cytology input form.',
      actionLabel: 'Move Forward'
    },
    {
      id: 'family_nodes',
      stageNum: '09',
      badge: 'PEDIGREE NODES',
      title: 'Construct Family Pedigree Tree',
      targetSelector: '#guide-add-family-btn',
      fallbackSelector: '#guide-family-tab-btn',
      instruction:
        'Here on the Family Network canvas, you map out your family lineage. Adding 1st and 2nd degree relatives with hereditary conditions calculates genetic transmission weights for multi-disease risk assessment.',
      hint: 'Highlighted: Add Member button on Family Network canvas.',
      actionLabel: 'Move Forward'
    },
    {
      id: 'final_analyse',
      stageNum: '10',
      badge: unlockCriteria.isUnlocked ? 'ANALYSIS UNLOCKED' : 'ANALYSIS LOCKED',
      title: 'Generate Unified Clinical Analysis',
      targetSelector: '#guide-final-analysis-btn',
      instruction: unlockCriteria.isUnlocked
        ? 'All 3 prerequisites are satisfied! You can now generate the final comprehensive diagnostic report by fusing personal laboratory telemetry with genetic pedigree transmission probabilities across all 5 organ systems.'
        : 'This generates the final comprehensive diagnostic report by fusing personal laboratory telemetry with genetic pedigree transmission probabilities. It is currently locked until all 3 clinical criteria are met (Complete Profile, Input all 5 Diseases, and Add at least 2 Family Members).',
      hint: unlockCriteria.isUnlocked
        ? '🔓 Unlocked: Ready to synthesize report. Click "Generate Final Analysis" on the canvas.'
        : `🔒 Locked (${unlockCriteria.criteriaMetCount}/3 Prerequisites Met): Click the button on canvas to inspect the missing requirements modal.`,
      actionLabel: 'Finish Walkthrough'
    }
  ];

  const totalSteps = STEPS.length;
  const isComplete = currentStep >= totalSteps;
  const currentStepData = STEPS[currentStep] || STEPS[totalSteps - 1];

  // Locate and measure target element for glowing tactical reticle
  const updateTargetRect = useCallback(() => {
    if (isComplete) {
      setTargetRect(null);
      return;
    }

    const primarySelector = currentStepData?.targetSelector;
    const fallbackSelector = currentStepData?.fallbackSelector;

    let targetEl = primarySelector ? document.querySelector(primarySelector) : null;
    if (!targetEl && fallbackSelector) {
      targetEl = document.querySelector(fallbackSelector);
    }

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      // Only highlight if element is visible with non-zero dimensions
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });

        // Smoothly scroll target into view if off-screen
        const isOffScreen =
          rect.top < 60 ||
          rect.bottom > window.innerHeight - 80;

        if (isOffScreen) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }
    setTargetRect(null);
  }, [currentStepData, isComplete]);

  // Recalculate reticle on step changes, tab changes, active module changes, scroll, or resize
  useEffect(() => {
    updateTargetRect();
    const t1 = setTimeout(updateTargetRect, 60);
    const t2 = setTimeout(updateTargetRect, 180);
    const t3 = setTimeout(updateTargetRect, 350);
    const t4 = setTimeout(updateTargetRect, 600);

    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [updateTargetRect, currentStep, activeTab, activeModule]);

  // Handle Forward Click
  const handleForward = () => {
    playTacticalSound(currentStep === totalSteps - 1 ? 'complete' : 'next', isMuted);
    if (onNextStep) {
      onNextStep(currentStep);
    }
  };

  // Handle Skip Click (turns guide OFF immediately)
  const handleSkip = () => {
    playTacticalSound('skip', isMuted);
    if (onSkip) {
      onSkip();
    }
  };

  // Minimized Pill View
  if (isMinimized) {
    return (
      <div className="guide-hud-container" style={{ width: 'auto' }}>
        <div className="guide-hud-pill" onClick={() => setIsMinimized(false)}>
          <div className="guide-hud-status-dot" />
          <span className="guide-hud-pill-title">
            {isComplete
              ? '🏆 Tour Complete'
              : `Guide [${currentStepData?.stageNum}/${totalSteps}]: ${currentStepData?.title}`}
          </span>
          <Maximize2 size={13} style={{ opacity: 0.7 }} />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* TARGET RETICLE & SPOTLIGHT OVERLAY */}
      {targetRect && (
        <div className="guide-overlay-root">
          <div
            className="guide-reticle-box"
            style={{
              top: `${targetRect.top - 6}px`,
              left: `${targetRect.left - 6}px`,
              width: `${targetRect.width + 12}px`,
              height: `${targetRect.height + 12}px`
            }}
          >
            <div className="guide-reticle-tr" />
            <div className="guide-reticle-bl" />
            <div className="guide-target-badge">
              <Target size={12} />
              <span>{`HIGHLIGHT [${currentStepData?.stageNum}]: ${currentStepData?.badge}`}</span>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING MISSION HUD */}
      <div className="guide-hud-container">
        <div className="guide-hud-card">
          {/* HEADER */}
          <div className="guide-hud-header">
            <div className="guide-hud-title-group">
              <div className="guide-hud-badge">
                <span className="guide-hud-status-dot" />
                <span>Feature Guide</span>
              </div>
              <span className="guide-hud-step-count">
                {isComplete ? 'ALL FEATURES VIEWED' : `STEP ${currentStep + 1} OF ${totalSteps}`}
              </span>
            </div>

            <div className="guide-hud-controls">
              <button
                className="guide-hud-icon-btn"
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>

              <button
                className="guide-hud-icon-btn"
                onClick={() => setIsMinimized(true)}
                title="Minimize HUD"
              >
                <Minimize2 size={13} />
              </button>

              <button
                className="guide-hud-icon-btn skip-btn"
                onClick={handleSkip}
                title="Skip & Turn Off Guide"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* PROGRESS PIPS (10 STAGES) */}
          <div className="guide-hud-pips">
            {STEPS.map((step, idx) => (
              <div
                key={step.id}
                className={`guide-hud-pip ${
                  idx < currentStep ? 'completed' : idx === currentStep && !isComplete ? 'active' : ''
                }`}
                title={`Stage ${idx + 1}: ${step.title}`}
              />
            ))}
          </div>

          {/* HUD BODY */}
          {isComplete ? (
            <div className="guide-hud-complete">
              <div className="guide-hud-trophy-icon">
                <Trophy size={28} />
              </div>
              <div className="guide-hud-stage-name" style={{ justifyContent: 'center' }}>
                WALKTHROUGH COMPLETE!
              </div>
              <div className="guide-hud-instruction" style={{ textAlign: 'center' }}>
                You have explored all core modules and all 5 clinical disease models of GeneGuard: Personal Profile &rarr; Lab Telemetry &rarr; Auto-Fill Biomarkers &rarr; Cardiovascular &rarr; Metabolic &rarr; Hypertension &rarr; Thyroid &rarr; Oncology &rarr; Family Pedigree &rarr; Unified Multi-Organ Analysis.
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  className="btn-hud-skip"
                  style={{ flex: 1 }}
                  onClick={onRestart}
                >
                  <RotateCcw size={13} />
                  <span>Replay Walkthrough</span>
                </button>
                <button
                  className="btn-hud-forward"
                  style={{ flex: 1.4 }}
                  onClick={handleSkip}
                >
                  <span>Close & Explore</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="guide-hud-body">
              <div className="guide-hud-stage-name">
                <span className="stage-num">[{currentStepData?.stageNum}]</span>
                <span>{currentStepData?.title}</span>
              </div>

              <div className="guide-hud-instruction">
                {currentStepData?.instruction}
              </div>

              <div className="guide-hud-tip-box">
                <Info size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{currentStepData?.hint}</span>
              </div>

              {/* ACTION BUTTONS ROW */}
              <div className="guide-hud-actions">
                {currentStep > 0 && (
                  <button
                    className="btn-hud-prev"
                    onClick={() => {
                      playTacticalSound('next', isMuted);
                      if (onPrevStep) onPrevStep(currentStep);
                    }}
                    title="Previous Feature"
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}

                <button
                  className="btn-hud-forward"
                  onClick={handleForward}
                >
                  <span>{currentStepData?.actionLabel}</span>
                  <ChevronRight size={16} />
                </button>

                <button
                  className="btn-hud-skip"
                  onClick={handleSkip}
                  title="Turn off guided navigation"
                >
                  <X size={13} />
                  <span>Skip Guide</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
