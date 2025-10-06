import {ChartJSNodeCanvas} from 'chartjs-node-canvas';
class GraphController {
    constructor(){
        this.width = 800;
        this.height = 600;
        this.ChartJSNodeCanvas = new ChartJSNodeCanvas({
            width: this.width,
            height: this.height,
            backgroundColor:"white",
        });
    }
    
    /** 
     * @desc Generate a dynamic chart image from chart.js config
     * @route POST /generate-graph
     * @access Protected (since we are using requireAuth in routes)
     */
    async generateGraph(req,res){
        try{
            const config = req.body;
            if(!config || !config.type || !config.data){
                return res.status(400).json({error: "Invalid chart configuration"});
            }
            if(!config.options){
                config.options ={
                    responsive: false,
                    plugins:{
                        legend:{display:true},
                        title:{display:false},
                    },
                };
            }

            const imageBuffer = await this.ChartJSNodeCanvas.renderToBuffer(config);
            res.set("Content-Type","image/png");
            res.send(imageBuffer);
        }catch(err){
            console.log("Error in generating graph: ",err);
            res.status(500).json({error: "Failed to generate graph"});
        }
    }
}
export default GraphController;