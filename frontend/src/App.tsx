import React, { useState, useEffect, useRef } from "react";
import { API_URL } from "./config";

type State = "idle" | "uploading" | "done" | "error";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const colors = {
    green: "#0DC267",
    greenHover: "#0AAE5A",
    greenLight: "#E6F9EF",
    bg: "#F5F5F5",
    white: "#FFFFFF",
    text: "#333333",
    textSecondary: "#999999",
    border: "#D6D6D6",
    error: "#FF4444",
    errorBg: "#FFF0F0",
    reject: "#D32F2F",
    rejectBg: "#FDE8E8",
    rejectBorder: "#F5C6C6",
};

const App: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [state, setState] = useState<State>("idle");
    const [progress, setProgress] = useState<number>(0);
    const [message, setMessage] = useState<string | null>(null);
    const [btnHover, setBtnHover] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let timer: number | undefined;
        if (state === "uploading") {
            setProgress(0);
            const start = Date.now();
            const duration = 4000;
            timer = window.setInterval(() => {
                const elapsed = Date.now() - start;
                const p = Math.min(100, Math.round((elapsed / duration) * 100));
                setProgress(p);
                if (p >= 100) window.clearInterval(timer);
            }, 80);
        }
        return () => {
            if (timer) window.clearInterval(timer);
        };
    }, [state]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setMessage(null);
        setProgress(0);
        setState("idle");

        const f = e.target.files?.[0];
        if (!f) {
            setFile(null);
            return;
        }

        if (f.name !== "cv.pdf") {
            setError("Имя файла должно быть строго «cv.pdf».");
            setFile(null);
            return;
        }

        if (f.size > MAX_SIZE_BYTES) {
            setError("Размер файла не должен превышать 5 МБ.");
            setFile(null);
            return;
        }

        setFile(f);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (!file) {
            setError("Сначала выберите файл «cv.pdf».");
            return;
        }

        setState("uploading");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${API_URL}/api/upload`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setState("error");
                setError(data.error || "Ошибка загрузки файла.");
                return;
            }

            setState("done");
            setMessage(data.message || "Резюме отклонено по неизвестной причине.");
        } catch {
            setState("error");
            setError("Не удалось отправить файл. Проверьте подключение к серверу.");
        }
    };

    const reset = () => {
        setFile(null);
        setError(null);
        setMessage(null);
        setState("idle");
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const uploading = state === "uploading";
    const done = state === "done";

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: colors.bg,
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
        >
            <div
                style={{
                    background: colors.white,
                    padding: "40px 48px",
                    borderRadius: "16px",
                    width: "100%",
                    maxWidth: "560px",
                    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
                    border: `1px solid ${colors.border}`,
                }}
            >
                {/* Заголовок */}
                <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "32px" }}>📄</span>
                    <h1 style={{ fontSize: "28px", fontWeight: 700, color: colors.text, margin: 0 }}>
                        Загрузка резюме
                    </h1>
                </div>
                <p style={{ fontSize: "17px", color: colors.textSecondary, marginBottom: "32px", lineHeight: 1.5 }}>
                    {done
                        ? "Ваше резюме было рассмотрено. Результат ниже."
                        : <>Загрузите файл <strong style={{ color: colors.text }}>cv.pdf</strong> (до 5 МБ), и наш ИИ‑рекрутер мгновенно вынесет решение.</>
                    }
                </p>

                <form onSubmit={handleSubmit}>
                    {/* Зона выбора файла — скрываем после решения */}
                    {!done && (
                        <div
                            onClick={() => !uploading && fileInputRef.current?.click()}
                            style={{
                                border: `2px dashed ${file ? colors.green : colors.border}`,
                                borderRadius: "12px",
                                padding: "32px 24px",
                                textAlign: "center",
                                cursor: uploading ? "not-allowed" : "pointer",
                                background: file ? colors.greenLight : colors.white,
                                transition: "all 0.2s ease",
                                marginBottom: "24px",
                            }}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                disabled={uploading}
                                style={{ display: "none" }}
                            />
                            {file ? (
                                <>
                                    <div style={{ fontSize: "40px", marginBottom: "8px" }}>✅</div>
                                    <div style={{ fontSize: "18px", fontWeight: 600, color: colors.text }}>
                                        {file.name}
                                    </div>
                                    <div style={{ fontSize: "15px", color: colors.textSecondary, marginTop: "4px" }}>
                                        {(file.size / 1024 / 1024).toFixed(2)} МБ
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: "40px", marginBottom: "8px" }}>📎</div>
                                    <div style={{ fontSize: "18px", fontWeight: 500, color: colors.text }}>
                                        Нажмите, чтобы выбрать файл
                                    </div>
                                    <div style={{ fontSize: "15px", color: colors.textSecondary, marginTop: "4px" }}>
                                        Только cv.pdf, до 5 МБ
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Прогресс-бар */}
                    {state === "uploading" && (
                        <div style={{ marginBottom: "24px" }}>
                            <div
                                style={{
                                    height: "10px",
                                    background: "#E8E8E8",
                                    borderRadius: "999px",
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        height: "100%",
                                        width: `${progress}%`,
                                        background: `linear-gradient(90deg, ${colors.green}, #34D399)`,
                                        borderRadius: "999px",
                                        transition: "width 0.1s linear",
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    marginTop: "8px",
                                    fontSize: "15px",
                                    color: colors.textSecondary,
                                    textAlign: "right",
                                }}
                            >
                                Анализ резюме... {progress}%
                            </div>
                        </div>
                    )}

                    {/* Ошибка валидации */}
                    {error && (
                        <div
                            style={{
                                marginBottom: "20px",
                                fontSize: "16px",
                                color: colors.error,
                                background: colors.errorBg,
                                padding: "14px 16px",
                                borderRadius: "10px",
                                border: "1px solid #FFCCCC",
                                lineHeight: 1.4,
                            }}
                        >
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Результат-отказ — КРАСНЫЙ */}
                    {message && (
                        <div
                            style={{
                                marginBottom: "24px",
                                fontSize: "17px",
                                color: colors.reject,
                                background: colors.rejectBg,
                                padding: "20px 24px",
                                borderRadius: "12px",
                                border: `1px solid ${colors.rejectBorder}`,
                                lineHeight: 1.6,
                            }}
                        >
                            <div
                                style={{
                                    fontWeight: 700,
                                    marginBottom: "8px",
                                    fontSize: "18px",
                                    color: colors.reject,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                ❌ Отказ
                            </div>
                            {message}
                        </div>
                    )}

                    {/* Кнопки */}
                    <div style={{ display: "flex", gap: "12px" }}>
                        {/* Кнопка отправки — скрываем после решения */}
                        {!done && (
                            <button
                                type="submit"
                                disabled={uploading || !file}
                                onMouseEnter={() => setBtnHover(true)}
                                onMouseLeave={() => setBtnHover(false)}
                                style={{
                                    flex: 1,
                                    padding: "16px 24px",
                                    borderRadius: "10px",
                                    border: "none",
                                    background:
                                        uploading || !file
                                            ? "#CCCCCC"
                                            : btnHover
                                                ? colors.greenHover
                                                : colors.green,
                                    color: colors.white,
                                    cursor: uploading || !file ? "not-allowed" : "pointer",
                                    fontWeight: 700,
                                    fontSize: "18px",
                                    transition: "background 0.2s ease",
                                    letterSpacing: "0.3px",
                                }}
                            >
                                {uploading ? "Отправка..." : "Отправить резюме"}
                            </button>
                        )}

                        {/* Кнопка «Попробовать снова» — после решения или ошибки */}
                        {(done || state === "error") && (
                            <button
                                type="button"
                                onClick={reset}
                                style={{
                                    flex: 1,
                                    padding: "16px 24px",
                                    borderRadius: "10px",
                                    border: "none",
                                    background: colors.green,
                                    color: colors.white,
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    fontSize: "18px",
                                    transition: "background 0.2s ease",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background = colors.greenHover)
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = colors.green)
                                }
                            >
                                Попробовать снова
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default App;
