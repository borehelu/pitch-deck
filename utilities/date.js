import moment from "moment";
export default function getCurrentDate(){
    return moment(new Date()).format( 'YYYY-MM-DD  HH:mm:ss' );
}