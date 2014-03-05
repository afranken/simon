/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../vendor/knockout.d.ts" />
/// <reference path="../vendor/moment.d.ts" />
import ko = require('knockout');
import moment = require('moment');
import Types = require('../Types');
import MonitorModel = require('../MonitorModel');
import Connector = require('../connector/Connector');
import CssClasses = require('../CssClasses');
import JenkinsConnector = require('./JenkinsConnector');
import Config = require('../jsonInterfaces/Config');
import JenkinsJsonResponse = require('../jsonInterfaces/JenkinsResponse');

/**
 * Model that represents a Jenkins Job
 */
class JenkinsMonitorModel implements MonitorModel {

    private static OPACITY:string = 'opacity: ';
    private static DEFAULT_OPACITY:number = 1.0;

    private _connector:Connector;
    private _name:string;
    private _id:string;
    private _hostname:string;
    private _css:KnockoutComputed<string>;
    private _style:KnockoutComputed<string>;
    private _startDate:KnockoutComputed<string>;
    private _url:string;
    private _jsonResponse:KnockoutObservable<JenkinsJsonResponse.Json> = ko.observable<JenkinsJsonResponse.Json>();

    constructor(job:Config.Monitor, connector:Connector, hostname:string) {
        this._connector = connector;
        this._name = job.name;
        this._id = job.id;
        this._hostname = job.hostname !== undefined ? job.hostname : hostname;
        this._css = ko.computed<string>({
                owner: this,
                read: ()=>{
                    return CssClasses.BASIC_CLASSES + JenkinsMonitorModel.translateColor(this.getResponseColor());
                }
        });
        this._style = ko.computed<string>({
            owner: this,
            read: ()=>{
                return JenkinsMonitorModel.OPACITY+JenkinsMonitorModel.calculateExpiration(this.getResponseTimestamp(), (<JenkinsConnector>this._connector).getExpiry());
            }
        });

        this._startDate = ko.computed<string>({
            owner: this,
            read: ()=>{
                return JenkinsMonitorModel.calculateStartDate(this.getResponseTimestamp());
            }
        });
        this._url = (<JenkinsConnector>connector).getJobUrl(this);
    }

    public updateStatus():void {
        this._connector.getRemoteData(this);
    }

    public getName():string {
        return this._name !== undefined ? this._name : this._id;
    }

    public getId():string {
        return this._id;
    }

    public getHostname():string {
        return this._hostname;
    }

    public getCss():string {
        return this._css();
    }

    public getStyle():string {
        return this._style();
    }

    public getUrl():string {
        return this._url;
    }

    public getStartDate():string {
        return this._startDate();
    }

    public getType():string {
        return Types.JENKINS;
    }

    public setData(json:JenkinsJsonResponse.Json):void {
        this._jsonResponse(json);
    }

    //==================================================================================================================

    private static calculateStartDate(buildTimestamp: number):string {
        var startTime:string;
        if(buildTimestamp === undefined) {
            return undefined;
        }

        startTime = moment(buildTimestamp).fromNow();

        return startTime;
    }

    /**
     * Get expiration based on the amount of time that passed between the {@link JenkinsJsonResponse.LastBuild.timestamp} and now.
     *
     * @param expiry time in hours
     * @param buildTimestamp
     *
     * @returns number between 0.25 (=expired) and 1.0 (job ran recently)
     */
    private static calculateExpiration(buildTimestamp: number, expiry: number):number {

        if(buildTimestamp === undefined) {
            return JenkinsMonitorModel.DEFAULT_OPACITY;
        }

        var expireStyle:number;

        //calculate timestamp and expiration
        var nowTimestamp:number = new Date().getTime();
        var ageMinutes:number = Math.round(nowTimestamp - buildTimestamp) / (1000 * 60);
        var expiredPercent = 1 - (ageMinutes / (expiry * 60));  // 0=expired, 1=fresh

        if (expiredPercent < 0) {

            // age has exceeded ttl
            expireStyle = 0.25;
        }
        else {

            // age is within ttl
            expireStyle = 0.5 + (expiredPercent * 0.5);
        }

        return expireStyle;
    }

    /**
     * Translate colors from Jenkins to twitter bootstrap styles
     * @param color
     * @returns string
     */
    private static translateColor(color:string):string {
        var colorTranslation:string;

        switch(color){
            case 'blue':
                colorTranslation = CssClasses.SUCCESS;
                break;
            case 'red':
                colorTranslation = CssClasses.FAILURE;
                break;
            case 'yellow':
                colorTranslation = CssClasses.WARNING;
                break;
            case 'yellow_anime':
                colorTranslation = CssClasses.BUILDING+CssClasses.WARNING;
                break;
            case 'red_anime':
                colorTranslation = CssClasses.BUILDING+CssClasses.FAILURE;
                break;
            case 'blue_anime':
                colorTranslation = CssClasses.BUILDING+CssClasses.SUCCESS;
                break;
            case 'notbuilt':
                colorTranslation = CssClasses.DISABLED;
                break;
            default:
                colorTranslation = "";
        }

        return colorTranslation;
    }

    private getResponseTimestamp():number {
        var timestamp:number = undefined;
        if(this._jsonResponse() !== undefined) {
            timestamp = this._jsonResponse().lastBuild.timestamp;
        }
        return timestamp;
    }

    private getResponseColor():string {
        var color:string = undefined;
        if(this._jsonResponse() !== undefined) {
            color = this._jsonResponse().color;
        }
        return color;
    }
}

export = JenkinsMonitorModel;
