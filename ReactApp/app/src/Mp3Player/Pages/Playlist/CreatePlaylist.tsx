import React, { Component } from 'react'
import "./CreatePlaylist.scss";

class Validator extends Component<{ Error?: string }> {
	render() {
		return <div className='validate-container'>
			<span className="validate-error-text">{this.props.Error}</span>
			<h1 className={`${!this.props.Error ? "validating" : "validate-error"} validator material-icons`}>{this.props.Error ? "sync_problem" : "loop"}</h1>
		</div>
	}
}

export default class CreatePlaylist extends Component {
	Submit(Event: React.FormEvent<HTMLFormElement>) {
		Event.preventDefault();
		let Name = ((Event.target as HTMLFormElement).elements[0] as HTMLInputElement).value;
		Name = Name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").substr(0, 50);
		window.API.post("/playlists/create", {
			Name: Name
		}).then(Response => {
			console.log(Response);
		}).catch(Error => {
			console.error(Error);
		})
	}
	render() {
		return (
			<div className="page-padding">
				<h1>Create a new playlist</h1>
				<form onSubmit={(Event) => this.Submit(Event)} style={{ width: "100%" }}>
					<h3>Give your playlist a title!</h3>
					<input id="playlist-name" className="playlist-name" placeholder="Playlist name..." maxLength={50}></input>
					<Validator />
					{/* Reusing styles */}
					<div className="validate-container" style={{ marginTop: 45 }}>
						<button className="button-highlight" type="submit">Create</button>
					</div>
				</form>
			</div>
		)
	}
}
