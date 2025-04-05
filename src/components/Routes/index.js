
import LayoutDefault from "../../layout/LayoutDefault";
import Home from "../../pages/Home";
import Listening from "../../pages/Listening";
import Quizz from "../../pages/Quizz";
import Quizz2 from "../../pages/Quizz2";
import Speaking from "../../pages/Speaking";
import SpeechToText from "../audioToTxt";

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
                path: 'att',
                element: <SpeechToText />
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