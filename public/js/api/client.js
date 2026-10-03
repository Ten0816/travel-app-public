const API_BASE = "./api";


export async function apiRequest(
    path,
    options = {},
    defaultMessage = "通信に失敗しました。"
) {
    const response =
        await fetch(
            `${API_BASE}${path}`,
            options
        );


    if (!response.ok) {

        let message =
            defaultMessage;


        try {

            const error =
                await response.json();

            message =
                error.error ||
                defaultMessage;

        } catch {
            // JSONでない場合はデフォルトメッセージを使用
        }


        throw new Error(message);
    }


    // 204 No Content
    if (response.status === 204) {
        return null;
    }


    return response.json();
}