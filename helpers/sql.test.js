const {sqlForPartialUpdate} = require("./sql")

describe("Test function used to update SQL data", function () {
    updateData = {firstName: "Upgrayyd"};
    test("Partial Update of Name", async function() {

        /*Update first name with "Upgrayyd".
            Returns SQL Query in proper format and value to assign in db.query
        */
      const {setCols, values} = sqlForPartialUpdate(updateData,{firstName: "first_name"});
    expect(setCols).toEqual('"first_name"=$1');
    expect(values).toEqual([ 'Upgrayyd' ]);

}); /*Update the password as opensesame
    Returns the SQL Query and value to include in db.query string. 
*/
    test("Partial Update of Password", async function() {
        const {setCols, values} = sqlForPartialUpdate({password:"opensesame"}, {firstName: "first_name", lastName: "last_name", isAdmin: "is_admin"});
        expect(setCols).toEqual('"password"=$1');
        expect(values).toEqual([ 'opensesame' ]);
    })

    /*Test Inserting an empty value returns the SQL Query String and an empty value  to assign to the column*/
    test("Empty Data When updating", async function() {
        const {setCols, values} = sqlForPartialUpdate({lastName: ''}, {firstName: "first_name", lastName: "last_name", isAdmin: "is_admin"})
        expect(setCols).toEqual('"last_name"=$1');
        expect(values).toEqual([ '' ]);
    })
});
      