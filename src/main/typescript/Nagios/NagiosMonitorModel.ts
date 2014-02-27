import Config = require('../JsonInterfaces/Config');
import MonitorModel = require('../MonitorModel');
import Connector = require('../Connector/Connector');
import CssClasses = require('../CssClasses');
import NagiosConnector = require('./NagiosConnector');
import NagiosHostModel = require('./NagiosHostModel');
import NagiosJsonResponse = require('../JsonInterfaces/NagiosResponse');

/**
 * Model that represents a list of Nagios hosts
 */
class NagiosMonitorModel implements MonitorModel {

    public static TYPE:string = 'nagios';
    public hostmodels:Array<NagiosHostModel> = [];
    public id:string;
    public hostname:string;

    private name:string;
    private connector:NagiosConnector;

    constructor(job:Config.Monitor, connector:Connector, hostname:string) {
        this.name = job.name;
        this.id = job.id;
        this.connector = <NagiosConnector>connector;
        this.hostname = job.hostname !== undefined ? job.hostname : hostname;

        this.init(job.id);
    }

    private init(id:string) {
        var hostnames:string[] = id.split(',');
        hostnames.forEach((hostname:string) => {
            var nagiosHostModel = new NagiosHostModel(hostname);
            nagiosHostModel.setUrl(this.connector.getHostInfoUrl(this.hostname,hostname));
            this.hostmodels.push(nagiosHostModel);
        });
    }

    public getType():string {
        return NagiosMonitorModel.TYPE;
    }

    public addService(hostname:string, service:NagiosJsonResponse.NagiosService):void {
        this.hostmodels.forEach(hostmodel => {
           if(hostmodel.hostname === hostname) {
               hostmodel.addService(service);
           }
        });
    }

    public updateStatus():void {
        this.connector.getRemoteData(this);
    }



}

export = NagiosMonitorModel;