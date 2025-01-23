/**
 * 图片转换
 * @description 图片转化成 base64
 * */
export async function imageConversionBase64(file: any): Promise<string> {
    return new Promise((resolve, reject) => {
        const render = new FileReader();
        render.onload = (e) => {
            resolve(e.target!.result as string);
        };
        render.onerror = (err) => {
            reject(err);
        };
        render.readAsDataURL(file);
    });
}
