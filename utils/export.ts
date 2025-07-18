/**
 * @file Utilitários de Exportação
 * @description Fornece funções para converter dados em formato CSV e iniciar o download no navegador.
 */

/**
 * Escapa um campo para uso em CSV, adicionando aspas se necessário.
 * @param field O valor do campo a ser escapado.
 * @returns A string escapada.
 */
const escapeCSV = (field: any): string => {
    const str = String(field === null || field === undefined ? '' : field);
    // Envolve com aspas se o campo contiver vírgulas, aspas ou quebras de linha.
    if (str.search(/("|,|\n)/g) >= 0) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

/**
 * Converte um array de objetos em uma string CSV.
 * @param data O array de objetos a ser convertido.
 * @param headers Um objeto mapeando as chaves do objeto para os nomes das colunas do CSV.
 * @returns A string formatada em CSV.
 */
export const convertToCSV = <T extends object>(
    data: T[], 
    headers: { [K in keyof T]?: string }
): string => {
    const headerKeys = Object.keys(headers) as (keyof T)[];
    const headerValues = headerKeys.map(key => headers[key]);

    const headerRow = headerValues.map(escapeCSV).join(',');
    
    const dataRows = data.map(row => {
        return headerKeys.map(key => escapeCSV(row[key])).join(',');
    });

    // Adiciona BOM para garantir a correta interpretação de caracteres UTF-8 no Excel
    return '\uFEFF' + [headerRow, ...dataRows].join('\n');
};

/**
 * Inicia o download de uma string CSV como um arquivo.
 * @param csvString A string CSV a ser baixada.
 * @param filename O nome do arquivo a ser salvo.
 */
export const downloadCSV = (csvString: string, filename: string) => {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
