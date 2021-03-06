import { TextField, Fab } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import * as _ from "lodash";
import * as React from "react";
import { Component } from "react";
import {LayerData} from "../entities/LayerData";
import {UploadFile} from "./UploadFile";


interface ILayerFormProps {
	images: {[key: string]: LayerData};

	updateImages(images: {[key: string]: LayerData}): void;

}

export class LayerForm extends Component<ILayerFormProps> {
	render() {
		return (
			<div>
				<div className="preview-list">
					{ Object.keys(this.props.images).map((key) => this.renderPreview(key)) }
				</div>
				<UploadFile
					fileTypes={ [".jpeg", ".png", ".jpg"] }
					onLoaded={ (ev) => {
						const {images, updateImages} = this.props;
						const item = (ev.target as any & { result: string }).result;
						const hash = `${Date.now()}`;
						const data = new LayerData(item, hash, `Этаж ${_.size(images) + 1}`);
						updateImages({...images, [hash]: data});
					} }
				/>
			</div>
		);
	}

	private renderPreview(key: string) {
		const data = this.props.images[key];
		return (
			<div className="preview-container">
				<TextField
					label="Название схемы"
					margin="normal"
					value={data.title}
					onChange={(event) => {
						data.title = event.target.value;
						this.forceUpdate();
					}}
				/>
				<img src={ data.image } className="preview-container__image" key={ key } style={{height: "auto", width: 200, marginTop: 10}}/>
				<Fab className="preview-container__remove-icon" onClick={ () => this.removeImage(key) }>
					<DeleteIcon/>
				</Fab>
			</div>
		);
	}

	private removeImage(key: string) {
		const {images, updateImages} = this.props;
		const newImages = _.cloneDeep(images)
		delete newImages[key];
		updateImages(newImages);
	}
}
