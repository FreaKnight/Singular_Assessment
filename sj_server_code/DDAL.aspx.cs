using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Web.Script.Serialization;
using System.Collections.Generic;

public partial class DDAL : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs eventArgs)
    {
        string connstr = ConfigurationManager.ConnectionStrings["DDAL"].ToString();
        string jsonErr = "{\"Procedure\":\"<Procedure>\",\"Line\":\"<Line>\",\"Severity\":\"<Severity>\",\"Message\":\"<Message>\",\"ErrorCode\":\"<ErrorCode>\"}";

        using (SqlConnection conn = new SqlConnection(connstr))
        {
            try
            {
                conn.Open();

                //vv Will be the responce in JSON format back to the client side / frontend
                string jsonResponse = ""; 
                //vv Not implemented yet, but a DB can have a list of sprocs to exec configured to a AppName
                string AppName = Request["AppName"].ToString();
                //vv Proc Name to exec, with above solution, this will be the action that will identify which proc exec of the AppName
                string Action = Request["Proc"].ToString();

                SqlCommand cmd = new SqlCommand(Action, conn)
                {
                    CommandType = CommandType.StoredProcedure
                };

                //For now I am hard coding the parameters list for each sproc, but can write a proc that will get the parameter list then match up the received data with the parameter list
                //This will make this more dynamic as I will loop through the parameter list and match up what is in the request
                //Example:
                //Frontend sends through a json data object like:
                //data = {
                //    ClientName: "Sean",
                //    ClientSurname: "Jonker",
                //    AddrTypeCode: "R",
                //    StreetAddress: "14 Jakaranda Avenue",
                //    Suburb: "Parow Valley",
                //    Town: "Cape Town",
                //    PostCode: "7500"
                //}
                //usp_Clients_sel has a parameter list of:
                //@ClientName varchar(30),
	            //@ClientSurname varchar(30),
	            //@AddrTypeCode       char(1),
	            //@StreetAddress varchar(200),
	            //@Suburb varchar(50),
	            //@Town varchar(50),
	            //@PostCode numeric(4, 0)
                //If the json object has emtpy string or the key does not exists then fix to a DBNull value
                //The proc can then raiserror if the value is required
                if (Action != "usp_AddrTypeCode_dd" || Action != "usp_Clients_dd" || Action != "usp_Products_sel") //<--These procs dont need parameters
                {
                    if (Action == "usp_Clients_sel" || Action == "usp_Clients_ins" || //<-- They share the same parameter list
                        Action == "usp_Clients_upd" || //<-- Has one additional parameter
                        Action == "usp_Clients_del") //<-- only clientid
                    {
                        if (Action != "usp_Clients_del")
                        {
                            string name = Request["ClientName"].ToString();
                            if (name == "")
                            {
                                cmd.Parameters.Add("@ClientName", SqlDbType.VarChar).Value = DBNull.Value;
                            }
                            else
                            {
                                //If the db provided the parameter list, it can also provide the size of the datatype,
                                //Then we can make sure that the string from the frontend is not longer than the db, and perhaps losing data when saved
                                cmd.Parameters.Add("@ClientName", SqlDbType.VarChar, 30).Value = name;
                            }

                            string surname = Request["ClientSurname"].ToString();
                            if (surname == "")
                            {
                                cmd.Parameters.Add("@ClientSurname", SqlDbType.VarChar).Value = DBNull.Value;
                            }
                            else
                            {
                                cmd.Parameters.Add("@ClientSurname", SqlDbType.VarChar, 30).Value = surname;
                            }

                            string addrtype = Request["AddrTypeCode"].ToString();
                            if (addrtype == "")
                            {
                                cmd.Parameters.Add("@AddrTypeCode", SqlDbType.Char).Value = DBNull.Value;
                            }
                            else
                            {
                                cmd.Parameters.Add("@AddrTypeCode", SqlDbType.Char, 1).Value = addrtype;
                            }

                            string straddr = Request["StreetAddress"].ToString();
                            if (straddr == "")
                            {
                                cmd.Parameters.Add("@StreetAddress", SqlDbType.VarChar).Value = DBNull.Value;
                            }
                            else
                            {
                                cmd.Parameters.Add("@StreetAddress", SqlDbType.VarChar, 200).Value = straddr;
                            }

                            string sub = Request["Suburb"].ToString();
                            if (sub == "")
                            {
                                cmd.Parameters.Add("@Suburb", SqlDbType.VarChar).Value = DBNull.Value;
                            }
                            else
                            {
                                cmd.Parameters.Add("@Suburb", SqlDbType.VarChar, 50).Value = sub;
                            }

                            string town = Request["Town"].ToString();
                            if (town == "")
                            {
                                cmd.Parameters.Add("@Town", SqlDbType.VarChar).Value = DBNull.Value;
                            }
                            else
                            {
                                cmd.Parameters.Add("@Town", SqlDbType.VarChar, 50).Value = town;
                            }

                            string postcode = Request["PostCode"].ToString();
                            if (postcode == "")
                            {
                                cmd.Parameters.Add("@PostCode", SqlDbType.Decimal).Value = DBNull.Value;
                            }
                            else
                            {
                                decimal PostCode;
                                try
                                {
                                    PostCode = Convert.ToDecimal(postcode);
                                }
                                catch
                                {
                                    throw new Exception("Decimal conversion failed");
                                }
                                cmd.Parameters.Add("@PostCode", SqlDbType.Decimal).Value = PostCode;
                            }
                        }

                        if (Action == "usp_Clients_upd" || Action == "usp_Clients_del")
                        {
                            string clientid = Request["ClientID"].ToString();
                            if (clientid == "")
                            {
                                cmd.Parameters.Add("@ClientID", SqlDbType.Int).Value = DBNull.Value;
                            }
                            else
                            {
                                Int64 ClientID;

                                try
                                {
                                    ClientID = Convert.ToInt64(clientid);
                                }
                                catch
                                {
                                    throw new Exception("Interger conversion failed");
                                }
                                cmd.Parameters.Add("@ClientID", SqlDbType.Int).Value = ClientID;
                            }
                        }
                    }
                    else if (Action == "usp_ClientBasket_ins")
                    {
                        string clientid = Request["ClientID"].ToString();
                        if (clientid == "")
                        {
                            cmd.Parameters.Add("@ClientID", SqlDbType.Int).Value = DBNull.Value;
                        }
                        else
                        {
                            Int64 ClientID;

                            try
                            {
                                ClientID = Convert.ToInt64(clientid);
                            }
                            catch
                            {
                                throw new Exception("Interger conversion failed");
                            }
                            cmd.Parameters.Add("@ClientID", SqlDbType.Int).Value = ClientID;
                        }

                        string productid = Request["ProductID"].ToString();
                        if (productid == "")
                        {
                            cmd.Parameters.Add("@ProductID", SqlDbType.Int).Value = DBNull.Value;
                        }
                        else
                        {
                            Int64 ProductID;

                            try
                            {
                                ProductID = Convert.ToInt64(productid);
                            }
                            catch
                            {
                                throw new Exception("Interger conversion failed");
                            }
                            cmd.Parameters.Add("@ProductID", SqlDbType.Int).Value = ProductID;
                        }
                    }
                }

                DataTable dt = new DataTable();
                SqlDataReader dr = cmd.ExecuteReader();

                dt.Load(dr);

                jsonResponse = "{\"rowset\":" + SerializeJson(dt) + "}";

                dr.Close();

                Response.AddHeader("Content-Type", "application/json");
                Response.ContentType = "application/json;charset=utf-8";
                Response.AddHeader("Pragma", "no-cache");
                Response.Expires = -1;
                Response.Write(jsonResponse);
            }
            catch (Exception ex)
            {
                Response.Clear();
                Response.AddHeader("Content-Type", "application/json");
                Response.ContentType = "application/json;charset=utf-8";
                Response.StatusCode = 500;

                SqlException sqlEx;

                if (ex.GetType() == typeof(SqlException))
                {
                    sqlEx = (SqlException)ex;

                    string errMsg = sqlEx.Message.ToString();
                    errMsg = errMsg.Replace("\"", "'");
                    errMsg = errMsg.Replace("\\", "/");

                    string severity = sqlEx.Class.ToString();

                    jsonErr = jsonErr.Replace("<Severity>", severity.ToString())
                        .Replace("<Message>", errMsg)
                        .Replace("<Procedure>", sqlEx.Procedure.ToString())
                        .Replace("<Line>", sqlEx.LineNumber.ToString())
                        .Replace("<ErrorCode>", sqlEx.Number.ToString());

                    jsonErr = jsonErr.Replace("\r\n", "<br/>");
                    jsonErr = jsonErr.Replace("\n", "<br/>");
                    jsonErr = jsonErr.Replace("\r", "<br/>");
                }
                else
                {
                    jsonErr = jsonErr.Replace("<Severity>", "0")
                        .Replace("<Message>", ex.Message)
                        .Replace("<Procedure>", "NonSQLError")
                        .Replace("<Line>", "0")
                        .Replace("<ErrorCode>", "0");
                }

                Response.StatusDescription = jsonErr;
                Response.Write(jsonErr);
                Response.Flush();
                Response.End();
            }
        }
    }

    public string SerializeJson(DataTable dt)
    {
        JavaScriptSerializer jsSerializer = new JavaScriptSerializer();
        List<Dictionary<string, object>> parentRow = new List<Dictionary<string, object>>();
        Dictionary<string, object> childRow;

        foreach(DataRow row in dt.Rows)
        {
            childRow = new Dictionary<string, object>();
            foreach(DataColumn col in dt.Columns)
            {
                childRow.Add(col.ColumnName, row[col]);
            }
            parentRow.Add(childRow);
        }
        return jsSerializer.Serialize(parentRow);
    }
}