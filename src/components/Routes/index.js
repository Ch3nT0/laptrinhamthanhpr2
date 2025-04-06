
import LayoutDefault from "../../layout/LayoutDefault";
import Home from "../../pages/Home";
import Listening from "../../pages/Listening";
import Quizz from "../../pages/Quizz";
import Quizz2 from "../../pages/Quizz2";
import Speaking from "../../pages/Speaking";
import Quizz0 from "../audioToTxt";

export const routes=[
    {
        path: '/',
        element:<LayoutDefault/>,
        children:[
            {
                path: '/',
                element: <Home />
            },
            {
                path: 'listening',
                element: <Listening />
            },{
                path: 'quizz/:id',
                element: <Quizz />
            },{
                path: 'test/:id',
                element: <Quizz0 />
            },{
                path: 'quizz2/:id',
                element: <Quizz2 />
            }
            ,{
                path: 'speaking',
                element: <Speaking />
            }
        ]
    }
]