import React, { useState, useEffect } from "react";
import "./App.css";
import web3 from "./web3";
import lottery from "./lottery"; // bunun içinde abi ve contract adresi var

function App() {
    // console.log(web3.version); // metamaskın web3 versiyonunu verir
    // web3.eth.getAccounts().then(console.log); // metamask ethereum adreslerini verir

    const [manager, setManager] = useState("");
    const [contractAddress, setContractAddress] = useState("");
    const [players, setPlayers] = useState([]);
    const [balance, setBalance] = useState("");
    const [biletParasi, setBiletParasi] = useState(0);
    const [mesaj, setMesaj] = useState("Büyük Çekliş Başlıyor!");
    const [kullaniciAdresi, setKullaniciAdresi] = useState("");

    // componentDidMount ve componentDidUpdate kullanımına benzer bir kullanım sunar:
    useEffect(() => {
        const getBaslangicDeger = async () => {
            const manager = await lottery.methods.manager().call(); // kontrat yönetici adresi
            setManager(manager);

            const contractAddress = await lottery.options.address; // kontrat adresi
            setContractAddress(contractAddress);

            const kullaniciAdresi = await web3.eth.getAccounts();
            setKullaniciAdresi(kullaniciAdresi[0]);
        };
        getBaslangicDeger();
    }, []); // ikinci parametre boş dize olursa, bu haliyle componentDidMount işlevi gerçekleşir

    useEffect(() => {
        const getDevamliDegiskenler = async () => {
            const players = await lottery.methods.getPlayers().call(); // para yatırmış oyuncular
            setPlayers(players);

            const balance = await web3.eth.getBalance(lottery.options.address); // kontratın toplam bakiyesi
            setBalance(balance);
        };
        getDevamliDegiskenler();
    }); // ikinci parametreye boş dizi vermezsek state her update olduğunda çalışır. dizi içinde parametre verirsek o değerler update olunca çalışır
    // bu haliyle on numara oldu. react dışından katılım sağlandığında da otomatik güncelliyor.

    function handleText(event) {
        setBiletParasi(event.target.value);
    }

    const submitYeniKatilimci = async (event) => {
        event.preventDefault();
        const metamaskAccounts = await web3.eth.getAccounts(); // Metamask hesaplarını alır. 0 numaralıyı kullanıcaz
        setMesaj("Katılma işlemi gerçekleşmesi bekleniyor...");
        await lottery.methods.enter().send({
            from: metamaskAccounts[0],
            value: web3.utils.toWei(biletParasi, "ether"),
        });
        setMesaj("Tebrikler. Çekilişe katıldın.");
    };

    const kazananiSec = async (event) => {
        event.preventDefault();
        const metamaskAccounts = await web3.eth.getAccounts(); // Metamask hesaplarını alır. 0 numaralıyı kullanıcaz
        setMesaj("Yarışma sonlanma işlemi başladı...");
        await lottery.methods.pickWinner().send({
            from: metamaskAccounts[0],
        });
        setMesaj("Yarışma sonlandı. Kazanan ödülü adldı.");
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>{mesaj}</h1>
                <div className="Yeni-Bilet">
                    <form>
                        <input onChange={handleText} value={biletParasi} name="title" placeholder="0" autoComplete="off" type="number" />
                        <button onClick={submitYeniKatilimci}>Add</button>
                    </form>
                </div>
                <p> Yönetici Adresi : {manager} </p>
                <p> Kullanıcı Adresi: {kullaniciAdresi}</p>
                <p> Contract Adresi : {contractAddress}</p>
                <p> Contract Bakiyesi: {web3.utils.fromWei(balance, "ether")} ether</p>
                <p>
                    Oyuncular:
                    {players.map((player) => {
                        return <li>{player}</li>;
                    })}
                </p>
                <button onClick={kazananiSec}>Piyangoyu bitir, kazananı belirle.</button>
            </header>
        </div>
    );
}

export default App;
