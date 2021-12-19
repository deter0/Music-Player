import React, { Component } from 'react'
import { Redirect } from 'react-router-dom';
import "./CreatePlaylist.scss";

// class Validator extends Component<{ Error?: string }> {
// 	render() {
// 		console.log("Rendering", this.props.Error);
// 		return <div className='validate-container'>
// 			<span className="validate-error-text">{this.props.Error}</span>
// 			<h1 className={`${!this.props.Error ? "validating" : "validate-error"} validator material-icons`}>{this.props.Error ? "sync_problem" : "loop"}</h1>
// 		</div>
// 	}
// }

export default class CreatePlaylist extends Component {
	state = { PlaylistName: "", Error: "Enter a name", Errored: true, Working: false, Redirect: false };
	Submit(Event: React.FormEvent<HTMLFormElement>) {
		Event.preventDefault();
		if (this.state.Errored) {
			(Event.target as HTMLButtonElement).disabled = true;
		} else {
			let Name = ((Event.target as HTMLFormElement).elements[0] as HTMLInputElement).value;
			Name = Name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 50);
			window.API.post("/playlists/create", {
				Name: Name
			}).then(Response => {
				this.setState({ Redirect: true });
			}).catch(Error => {
				console.error(Error);
			})
		}
	}
	render() {
		return this.state.Redirect ? <Redirect to={`/playlists/playlist?Name=${this.state.PlaylistName}`} /> : (
			<div className="page-padding">
				<h1>Create a new playlist</h1>
				<form autoComplete="off" onSubmit={(Event) => this.Submit(Event)} style={{ width: "100%" }}>
					<h3 style={{ marginBottom: 14 }}>Give your playlist a title!</h3>
					<input onInput={(Event) => {
						this.setState({ Errored: false, Working: true, PlaylistName: (Event.target as HTMLInputElement).value });
						window.WS.SendData<boolean>("ValidatePlaylistName", { Name: (Event.target as HTMLInputElement).value }, true).then(Response => {
							if (Response.Data === false) {
								console.log("ERROR!");
								this.setState({ Error: "Playlist Exists", Errored: true, Working: false });
							} else {
								this.setState({ Error: "", Errored: false, Working: false });
							}
						})
					}} id="playlist-name" className="playlist-name" placeholder="Playlist name..." maxLength={50}></input>

					<div className='validate-container'>
						<span className="validate-error-text">{this.state.Error}</span>
						<h1 className={`${this.state.Working ? "validating" : (this.state.Errored ? "validate-error" : "validated")} validator material-icons`}>{this.state.Working ? "loop" : (this.state.Errored ? "sync_problem" : "check_circle_outline")}</h1>
					</div>

					{/* <Validator Error={this.state.Errored !== "" ? this.state.Errored : undefined} /> */}
					{/* Reusing styles */}
					<div className="validate-container" style={{ marginTop: 45 }}>
						<button className="button-highlight" type="submit">Create</button>
					</div>
				</form>
			</div>
		)
	}
}
