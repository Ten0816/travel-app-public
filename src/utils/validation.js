/* ============================================================
   正の整数へ変換
   ============================================================ */

function parsePositiveInteger(
    value
) {

    const number =
        Number(value);


    if (
        !Number.isInteger(number) ||
        number <= 0
    ) {

        return null;

    }


    return number;

}


module.exports = {
    parsePositiveInteger
};