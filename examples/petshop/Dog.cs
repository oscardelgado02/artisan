namespace Petshop;

public class Dog : Animal, IPet
{
    public readonly int energy;

    public override void Speak()
    {
    }

    public void Fetch()
    {
    }

    public override string ToString()
    {
        return Name;
    }
}
