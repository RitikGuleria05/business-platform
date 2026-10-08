export const downloadFile = (data: Blob,fileName: string) => {
    const url = window.URL.createObjectURL(data);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
};