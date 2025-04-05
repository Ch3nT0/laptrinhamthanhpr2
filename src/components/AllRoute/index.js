import { useRoutes } from "react-router-dom";
import { routes } from "../Routes";
export default function AllRoute(){
    const element = useRoutes(routes)
    return(<>
        {element}
    </>)
}