As an authenticated User I want to be able

 1) Create FOMS Requests, 
    1.a here is the schema (pasted over from our C# project, transpose it into typescript and add it to the schema )
    public class FomsRequest
        {
        [PrimaryKey]
        public decimal? RMLS_ID { get; set; }
        public DateTime CREATE_DATETIME { get; set; }
        public string DFL_CODE { get; set; }
        public DateTime REQUESTED_DATETIME { get; set; }
        public string REQUESTOR_NAME { get; set; }
        public string REQUESTOR_ORG { get; set; }
        public string REQUESTOR_PHONE { get; set; }
        public string RESTORATION { get; set; }
        public string SCHEDULED { get; set; }
        public string CONTACT { get; set; }
        public string STATUS { get; set; }
        public string DESCRIPTION { get; set; }
        public string FACILITY {get;set;}
        public string DENIED_DESCRIPTION {get;set;}

        public string POC_PHONE { get; set; }
        }
    1.b the RMLS ID should be an auto generated value, we can use Convex's _id value in lue of the RMLS ID, so the user wouldnt enter this but they would see it in other screens
    1.c the create form should have data validation, and the following fields are required:     REQUESTOR_NAME, REQUESTOR_ORG,REQUESTOR_NUMBER, FACILITY, DESCRIPTION, REQUESTED_DATETIME, CONTACT,CONTACT_PHONE
    1.d status should be its own table FOMS_STATUS with two fields a status_id and a status value these are the statuses we need: R-Requested, D-Denied, C-Cancelled, A-Approved. (on foms request create we default to requested)


2) View a grid of FOMS Requests Cards
    2.a I should be able to select a specific FOMS request card and be navigated to the read only FOMS details page for that foms request
    2.b in the FOMS Request card, there should be a way to show the status of the FOMS Request
    2.c if a FOMS Request's status is penidng the Card for that FOMS Request should enable the ability to deny/approve the FOMSRequest, on denial a modal needs to be prompted to the user asking for a denial reason and inject it into the FOMSRequest's DENIED_DESCRIPTION field.
    2.d i should be able to search through the grid to shorten the dispalyed results, this should be a keyword search across all  columns (date times are handled in quick filters)
    2.e i should be able to have a quick filters section that allows me quick access to filters based on date ranges, status,
